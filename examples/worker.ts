import { Worker } from '../src/index.js';
import stream from 'node:stream';
import { DatabaseSync } from 'node:sqlite';
import diagnostics_channel from 'node:diagnostics_channel';

diagnostics_channel.subscribe('handling-worker:execution', (message) => {
  console.log('Worker execution event:', message);
});

const db = new DatabaseSync(':memory:');

db.exec('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)');

for (let i = 0; i < 100; i++) {
  db.exec("INSERT INTO users (name) VALUES ('john')");
}

const worker = new Worker({
  name: 'example-worker',
  fetch: async ({ signal }) => {
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
            "UPDATE users SET name = 'albert' WHERE id IN (SELECT id FROM users WHERE name = ? LIMIT 10) returning id, name"
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
  }
});

setTimeout(() => {
  console.log('Disposing worker...');
  worker.dispose();
}, 5100);

worker.start();
