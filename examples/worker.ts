import { Worker } from '../src/index.js';
import stream from 'node:stream';
import { setTimeout as sleep } from 'node:timers/promises';

async function* generate() {
  let index = 0;

  while (index < 4) {
    await sleep(50);
    index++;
    yield { name: 'hello' };
  }
}

const worker = new Worker({
  name: 'example-worker',
  fetch: async ({ signal }) => {
    // Simulate a fetch operation
    console.log('Fetching data...');

    if (signal.aborted) {
      throw new Error('Fetch operation was aborted');
    }

    const stream2 = stream.addAbortSignal(signal, stream.Readable.from(generate()));

    stream2.on('data', (data) => {
      console.debug('Stream:', data);
    });

    stream2.on('error', (err) => {
      console.error('Stream error:', err);
    });

    // for await (const item of stream2) { console.log('readable:', item); }

    console.log('Data fetched successfully.');
  }
});

worker.start();

setTimeout(() => {
  console.log('Disposing worker...');
  worker.dispose();
}, 1100);
