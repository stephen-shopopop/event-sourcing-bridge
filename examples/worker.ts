import { Worker } from '../src/index.js';
import stream from 'node:stream';
import { DatabaseSync } from 'node:sqlite';
import diagnostics_channel from 'node:diagnostics_channel';

diagnostics_channel.subscribe('handling-worker:execution', (message) => {
  console.log('Worker execution event:', message);
});

const db = new DatabaseSync(':memory:');

db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA temp_store = memory;
    PRAGMA optimize;
    PRAGMA busy_timeout = 5000;

    CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT);
`);

for (let i = 0; i < 1000; i++) {
  db.exec("INSERT INTO users (name) VALUES ('john')");
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
        .prepare(
          "UPDATE users SET name = 'albert' WHERE id IN (SELECT id FROM users WHERE name = ? LIMIT 50) returning id, name"
        )
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
    console.log('readable:', item);

    // Delete job
    db.exec(`DELETE FROM users WHERE id = ${item.id}`);
  }

  // Log the current user count
  console.log(db.prepare('SELECT COUNT(*) as count FROM users').get());

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
