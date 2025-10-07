import { setTimeout } from 'node:timers/promises';
import { bench, group, run } from 'mitata';
import { Worker } from '../src/library/worker.js';

/**
 * Benchmark suite for Worker class
 * 
 * This benchmark measures the performance of various Worker operations including:
 * - Worker instantiation
 * - Start/stop cycles
 * - Fetch execution with different intervals
 * - Error handling overhead
 * - Multiple concurrent workers
 */

// Helper: Create a no-op fetch function
const createNoOpFetch = () => async () => {};

// Helper: Create a fetch function with delay
const createDelayedFetch = (delayMs: number) => async () => {
  await setTimeout(delayMs);
};

// Helper: Create a fetch function that throws errors
const createErrorFetch = () => async () => {
  throw new Error('Benchmark error');
};

group('Worker Instantiation', () => {
  bench('new Worker()', () => {
    const worker = new Worker({
      name: 'bench-worker',
      interval: 1000,
      fetch: createNoOpFetch()
    });
    worker.dispose();
  });

  bench('new Worker() with custom interval', () => {
    const worker = new Worker({
      name: 'bench-worker',
      interval: 5000,
      fetch: createNoOpFetch()
    });
    worker.dispose();
  });

  bench('new Worker() with fetchProcessingTimeout', () => {
    const worker = new Worker({
      name: 'bench-worker',
      interval: 1000,
      fetchProcessingTimeout: 5000,
      fetch: createNoOpFetch()
    });
    worker.dispose();
  });

  bench('new Worker() with errorCallback', () => {
    const worker = new Worker({
      name: 'bench-worker',
      interval: 1000,
      errorCallback: () => {},
      fetch: createNoOpFetch()
    });
    worker.dispose();
  });
});

group('Worker Start/Stop Operations', () => {
  bench('start() method', () => {
    const worker = new Worker({
      name: 'bench-worker',
      interval: 1000,
      fetch: createNoOpFetch()
    });
    worker.start();
    worker.dispose();
  });

  bench('dispose() method', () => {
    const worker = new Worker({
      name: 'bench-worker',
      interval: 1000,
      fetch: createNoOpFetch()
    });
    worker.start();
    worker.dispose();
  });

  bench('start() -> dispose() cycle', () => {
    const worker = new Worker({
      name: 'bench-worker',
      interval: 1000,
      fetch: createNoOpFetch()
    });
    worker.start();
    worker.dispose();
  });

  bench('multiple dispose() calls (idempotency)', () => {
    const worker = new Worker({
      name: 'bench-worker',
      interval: 1000,
      fetch: createNoOpFetch()
    });
    worker.start();
    worker.dispose();
    worker.dispose();
    worker.dispose();
  });
});

group('Worker Execution - Fast Interval', () => {
  bench('1 iteration @ 1000ms interval', async () => {
    const worker = new Worker({
      name: 'bench-worker',
      interval: 1000,
      fetch: createNoOpFetch()
    });
    worker.start();
    await setTimeout(50);
    worker.dispose();
  });

  bench('fetch with 10ms delay', async () => {
    const worker = new Worker({
      name: 'bench-worker',
      interval: 1000,
      fetch: createDelayedFetch(10)
    });
    worker.start();
    await setTimeout(50);
    worker.dispose();
  });

  bench('fetch with 50ms delay', async () => {
    const worker = new Worker({
      name: 'bench-worker',
      interval: 1000,
      fetch: createDelayedFetch(50)
    });
    worker.start();
    await setTimeout(100);
    worker.dispose();
  });
});

group('Worker Error Handling', () => {
  bench('fetch throwing errors (with errorCallback)', async () => {
    const worker = new Worker({
      name: 'bench-worker',
      interval: 1000,
      errorCallback: () => {},
      fetch: createErrorFetch()
    });
    worker.start();
    await setTimeout(50);
    worker.dispose();
  });

  bench('fetch throwing errors (default errorCallback)', async () => {
    const worker = new Worker({
      name: 'bench-worker',
      interval: 1000,
      fetch: createErrorFetch()
    });
    worker.start();
    await setTimeout(50);
    worker.dispose();
  });

  bench('fetch with timeout abort', async () => {
    const worker = new Worker({
      name: 'bench-worker',
      interval: 1000,
      fetchProcessingTimeout: 10,
      fetch: async () => {
        await setTimeout(1000);
      }
    });
    worker.start();
    await setTimeout(50);
    worker.dispose();
  });
});

group('Worker Concurrency', () => {
  bench('2 concurrent workers', async () => {
    const worker1 = new Worker({
      name: 'bench-worker-1',
      interval: 1000,
      fetch: createNoOpFetch()
    });
    const worker2 = new Worker({
      name: 'bench-worker-2',
      interval: 1000,
      fetch: createNoOpFetch()
    });
    
    worker1.start();
    worker2.start();
    await setTimeout(50);
    worker1.dispose();
    worker2.dispose();
  });

  bench('5 concurrent workers', async () => {
    const workers = Array.from({ length: 5 }, (_, i) => 
      new Worker({
        name: `bench-worker-${i}`,
        interval: 1000,
        fetch: createNoOpFetch()
      })
    );
    
    for (const worker of workers) {
      worker.start();
    }
    await setTimeout(50);
    for (const worker of workers) {
      worker.dispose();
    }
  });

  bench('10 concurrent workers', async () => {
    const workers = Array.from({ length: 10 }, (_, i) => 
      new Worker({
        name: `bench-worker-${i}`,
        interval: 1000,
        fetch: createNoOpFetch()
      })
    );
    
    for (const worker of workers) {
      worker.start();
    }
    await setTimeout(50);
    for (const worker of workers) {
      worker.dispose();
    }
  });
});

group('Worker State Transitions', () => {
  bench('created -> active -> stopping -> stopped', async () => {
    const worker = new Worker({
      name: 'bench-worker',
      interval: 1000,
      fetch: createNoOpFetch()
    });
    // created
    worker.start();
    // active
    await setTimeout(50);
    worker.dispose();
    // stopping -> stopped
    await setTimeout(200);
  });

  bench('restart after stop', async () => {
    const worker = new Worker({
      name: 'bench-worker',
      interval: 1000,
      fetch: createNoOpFetch()
    });
    
    // First cycle
    worker.start();
    await setTimeout(50);
    worker.dispose();
    await setTimeout(200);
    
    // Second cycle
    worker.start();
    await setTimeout(50);
    worker.dispose();
    await setTimeout(200);
  });

  bench('multiple restart cycles (3 times)', async () => {
    const worker = new Worker({
      name: 'bench-worker',
      interval: 1000,
      fetch: createNoOpFetch()
    });
    
    for (let i = 0; i < 3; i++) {
      worker.start();
      await setTimeout(50);
      worker.dispose();
      await setTimeout(200);
    }
  });
});

group('Worker Memory and Resource Management', () => {
  bench('rapid create/dispose (100 iterations)', () => {
    for (let i = 0; i < 100; i++) {
      const worker = new Worker({
        name: `bench-worker-${i}`,
        interval: 1000,
        fetch: createNoOpFetch()
      });
      worker.dispose();
    }
  });

  bench('rapid start/dispose (50 iterations)', () => {
    for (let i = 0; i < 50; i++) {
      const worker = new Worker({
        name: `bench-worker-${i}`,
        interval: 1000,
        fetch: createNoOpFetch()
      });
      worker.start();
      worker.dispose();
    }
  });
});

group('Worker Fetch Performance Scenarios', () => {
  bench('lightweight fetch (no-op)', async () => {
    const worker = new Worker({
      name: 'bench-worker',
      interval: 1000,
      fetch: createNoOpFetch()
    });
    worker.start();
    await setTimeout(50);
    worker.dispose();
  });

  bench('fetch with CPU work (string manipulation)', async () => {
    const worker = new Worker({
      name: 'bench-worker',
      interval: 1000,
      fetch: async () => {
        let result = '';
        for (let i = 0; i < 100; i++) {
          result += `iteration-${i}`;
        }
        // Just use the result to avoid optimization
        void result;
      }
    });
    worker.start();
    await setTimeout(50);
    worker.dispose();
  });

  bench('fetch with Promise.all', async () => {
    const worker = new Worker({
      name: 'bench-worker',
      interval: 1000,
      fetch: async () => {
        await Promise.all([
          setTimeout(5),
          setTimeout(5),
          setTimeout(5)
        ]);
      }
    });
    worker.start();
    await setTimeout(50);
    worker.dispose();
  });
});

// Run all benchmarks
run();
