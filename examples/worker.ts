import { Worker } from '../src/index.js';
import stream from 'node:stream';
import { DatabaseSync } from 'node:sqlite';
import diagnostics_channel from 'node:diagnostics_channel';

diagnostics_channel.subscribe('handling-worker:execution', (message) => {
  console.log('Worker execution event:', message);
});

const db = new DatabaseSync(':memory:');
const SCHEMA_VERSION = '1';

// Initialize the database schema
db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA temp_store = memory;
    PRAGMA optimize;
    PRAGMA busy_timeout = 5000;

    CREATE TABLE IF NOT EXISTS queue_v${SCHEMA_VERSION} (
      id TEXT PRIMARY KEY DEFAULT ('m_' || lower(hex(randomblob(16)))),
      created TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ')),
      updated TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ')),
      name TEXT NOT NULL CHECK(length(name) <= 255),
      body BLOB NOT NULL,
      timeout INTEGER NOT NULL DEFAULT (unixepoch('now','subsec') * 1000) CHECK(timeout >= 0),
      received INTEGER NOT NULL DEFAULT 0,
      priority INTEGER NOT NULL DEFAULT 0 CHECK(priority >= 0 AND priority <= 255)
    ) STRICT;

    CREATE TRIGGER queue_updated_timestamp AFTER UPDATE ON queue_v${SCHEMA_VERSION} BEGIN
      UPDATE queue_v${SCHEMA_VERSION} SET updated = strftime('%Y-%m-%dT%H:%M:%fZ') WHERE id = old.id;
    end;

    CREATE INDEX queue_priority_created_idx ON queue_v${SCHEMA_VERSION} (name, priority desc, created);
`);

for (let i = 0; i < 1000; i++) {
  db.prepare(`INSERT INTO queue_v${SCHEMA_VERSION} (name, body) VALUES ('john', ?)`).run(
    Buffer.from(`hello world ${i}`)
  );
}

// Helper function that simulates a fetch operation
const fetch = async ({ signal }: { signal: AbortSignal }) => {
  // Simulate a fetch operation
  console.log('Fetching data...');

  if (signal.aborted) {
    throw new Error('Fetch operation was aborted');
  }

  const stream2 = stream.addAbortSignal(
    signal,
    stream.Readable.from(
      db
        .prepare(`
          UPDATE queue_v${SCHEMA_VERSION}
            SET
              timeout = (unixepoch('now','subsec') * 1000) + 1000 * POWER(2, received),
              received = received + 1
            WHERE id IN (
              SELECT id FROM queue_v${SCHEMA_VERSION}
              WHERE name = ? AND received < 1 AND (unixepoch('now','subsec') * 1000) >= timeout
              ORDER BY priority DESC, created
              LIMIT 50
            ) RETURNING id, name, body, created, updated, timeout, received, priority
        `)
        .iterate('john')
    )
  );

  // stream2.on('data', (data) => {
  //  console.debug('Stream:', data);
  // });

  //stream2.on('error', (err) => {
  //  console.error('Stream error:', err);
  //});

  for await (const item of stream2) {
    console.log('readable:', {
      ...item,
      body: item.body.toString(),
      timeout: new Date(item.timeout)
    });

    // Delete job
    db.prepare(`DELETE FROM queue_v${SCHEMA_VERSION} WHERE name= ? and id = ?`).run(
      item.name,
      item.id
    );
  }

  // Log the current user count
  console.log(db.prepare(`SELECT COUNT(*) AS count FROM queue_v${SCHEMA_VERSION}`).get());

  console.log('Data fetched successfully.');
};

const worker = new Worker({
  name: 'example-worker',
  fetch
});

for (let i = 0; i < 10; i++) {
  new Worker({
    name: `example-worker-${i}`,
    fetch
  }).start();
}

setTimeout(() => {
  console.log('Disposing worker...');
  worker.dispose();
}, 5000);

worker.start();
