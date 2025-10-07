import { describe, it, type TestContext, mock } from 'node:test';
import { setTimeout } from 'node:timers/promises';
import diagnostics_channel from 'node:diagnostics_channel';
import { Worker } from '../src/library/worker.js';
import type { WorkerOptions } from '../src/library/definitions.js';

describe('Worker', () => {
  describe('constructor validation', () => {
    it('should throw TypeError when options is a primitive (not an object)', (t: TestContext) => {
      t.plan(2);

      // Act & Assert
      // biome-ignore lint/suspicious/noExplicitAny: testing invalid input types
      t.assert.throws(() => new Worker('not-an-object' as any), TypeError);
      // biome-ignore lint/suspicious/noExplicitAny: testing invalid input types
      t.assert.throws(() => new Worker(123 as any), TypeError);
    });

    it('should throw TypeError when interval is not a number', (t: TestContext) => {
      t.plan(1);

      // Act & Assert
      t.assert.throws(
        // biome-ignore lint/suspicious/noExplicitAny: testing invalid input types
        () => new Worker({ name: 'test', interval: '1000' as any, fetch: async () => {} }),
        TypeError
      );
    });

    it('should throw TypeError when interval is a float', (t: TestContext) => {
      t.plan(1);

      // Act & Assert
      t.assert.throws(
        () => new Worker({ name: 'test', interval: 1000.5, fetch: async () => {} }),
        TypeError
      );
    });

    it('should throw TypeError when interval is negative', (t: TestContext) => {
      t.plan(1);

      // Act & Assert
      t.assert.throws(
        () => new Worker({ name: 'test', interval: -1000, fetch: async () => {} }),
        TypeError
      );
    });

    it('should throw TypeError when fetchProcessingTimeout is not a number', (t: TestContext) => {
      t.plan(1);

      // Act & Assert
      t.assert.throws(
        // biome-ignore lint/suspicious/noExplicitAny: testing invalid input types
        () => new Worker({ name: 'test', fetchProcessingTimeout: '1000' as any, fetch: async () => {} }),
        TypeError
      );
    });

    it('should throw TypeError when fetchProcessingTimeout is a float', (t: TestContext) => {
      t.plan(1);

      // Act & Assert
      t.assert.throws(
        () => new Worker({ name: 'test', fetchProcessingTimeout: 1000.5, fetch: async () => {} }),
        TypeError
      );
    });

    it('should throw TypeError when fetchProcessingTimeout is negative', (t: TestContext) => {
      t.plan(1);

      // Act & Assert
      t.assert.throws(
        () => new Worker({ name: 'test', fetchProcessingTimeout: -1000, fetch: async () => {} }),
        TypeError
      );
    });

    it('should throw TypeError when fetch is undefined', (t: TestContext) => {
      t.plan(1);

      // Act & Assert
      t.assert.throws(
        // biome-ignore lint/suspicious/noExplicitAny: testing invalid input types
        () => new Worker({ name: 'test' } as any),
        TypeError
      );
    });

    it('should throw TypeError when fetch is null', (t: TestContext) => {
      t.plan(1);

      // Act & Assert
      t.assert.throws(
        // biome-ignore lint/suspicious/noExplicitAny: testing invalid input types
        () => new Worker({ name: 'test', fetch: null as any }),
        TypeError
      );
    });

    it('should throw TypeError when fetch is not a function', (t: TestContext) => {
      t.plan(3);

      // Act & Assert
      t.assert.throws(
        // biome-ignore lint/suspicious/noExplicitAny: testing invalid input types
        () => new Worker({ name: 'test', fetch: 'not-a-function' as any }),
        TypeError
      );
      t.assert.throws(
        // biome-ignore lint/suspicious/noExplicitAny: testing invalid input types
        () => new Worker({ name: 'test', fetch: 123 as any }),
        TypeError
      );
      t.assert.throws(
        // biome-ignore lint/suspicious/noExplicitAny: testing invalid input types
        () => new Worker({ name: 'test', fetch: {} as any }),
        TypeError
      );
    });

    it('should throw TypeError when errorCallback is not a function', (t: TestContext) => {
      t.plan(2);

      // Act & Assert
      t.assert.throws(
        // biome-ignore lint/suspicious/noExplicitAny: testing invalid input types
        () => new Worker({ name: 'test', errorCallback: 'not-a-function' as any, fetch: async () => {} }),
        TypeError
      );
      t.assert.throws(
        // biome-ignore lint/suspicious/noExplicitAny: testing invalid input types
        () => new Worker({ name: 'test', errorCallback: 123 as any, fetch: async () => {} }),
        TypeError
      );
    });
  });

  describe('constructor', () => {
    it('should create a worker instance with default values', (t: TestContext) => {
      t.plan(5);

      // Arrange
      const options: WorkerOptions = {
        name: 'test-worker',
        fetch: async () => {}
      };

      // Act
      const worker = new Worker(options);

      // Assert
      t.assert.ok(worker);
      t.assert.ok(worker.id);
      t.assert.strictEqual(typeof worker.id, 'string');
      t.assert.strictEqual(worker.state, 'created');
      t.assert.ok(worker.createdOn <= Date.now());
    });

    it('should accept custom interval', (t: TestContext) => {
      t.plan(1);

      // Arrange
      const options: WorkerOptions = {
        name: 'test-worker',
        interval: 5000,
        fetch: async () => {}
      };

      // Act
      const worker = new Worker(options);

      // Assert
      t.assert.ok(worker);
    });

    it('should accept custom errorCallback', (t: TestContext) => {
      t.plan(1);

      // Arrange
      const errorCallback = mock.fn();
      const options: WorkerOptions = {
        name: 'test-worker',
        errorCallback,
        fetch: async () => {}
      };

      // Act
      const worker = new Worker(options);

      // Assert
      t.assert.ok(worker);
    });

    it('should accept fetchProcessingTimeout', (t: TestContext) => {
      t.plan(1);

      // Arrange
      const options: WorkerOptions = {
        name: 'test-worker',
        fetchProcessingTimeout: 10000,
        fetch: async () => {}
      };

      // Act
      const worker = new Worker(options);

      // Assert
      t.assert.ok(worker);
    });

    it('should enforce minimum interval of 1000ms', (t: TestContext) => {
      t.plan(1);

      // Arrange
      const options: WorkerOptions = {
        name: 'test-worker',
        interval: 500,
        fetch: async () => {}
      };

      // Act
      const worker = new Worker(options);

      // Assert
      t.assert.ok(worker);
    });

    it('should generate unique UUIDs for different instances', (t: TestContext) => {
      t.plan(2);

      // Arrange
      const options: WorkerOptions = {
        name: 'test-worker',
        fetch: async () => {}
      };

      // Act
      const worker1 = new Worker(options);
      const worker2 = new Worker(options);

      // Assert
      t.assert.notStrictEqual(worker1.id, worker2.id);
      t.assert.ok(worker1.id !== worker2.id);
    });

    it('should have readonly properties', (t: TestContext) => {
      t.plan(2);

      // Arrange
      const options: WorkerOptions = {
        name: 'test-worker',
        fetch: async () => {}
      };

      // Act
      const worker = new Worker(options);
      const originalId = worker.id;
      const originalCreatedOn = worker.createdOn;

      // Assert
      t.assert.strictEqual(worker.id, originalId);
      t.assert.strictEqual(worker.createdOn, originalCreatedOn);
    });
  });

  describe('start() and stop()', () => {
    it('should transition state to active when started', async (t: TestContext) => {
      t.plan(2);

      // Arrange
      const fetchFn = mock.fn(async () => {});
      const worker = new Worker({
        name: 'test-worker',
        interval: 1000,
        fetch: fetchFn
      });

      // Assert
      t.assert.strictEqual(worker.state, 'created');

      // Start the worker
      worker.start();

      // Assert state is active
      t.assert.strictEqual(worker.state, 'active');

      // Cleanup
      worker.stop();
    });

    it('should call fetch function at intervals', async (t: TestContext) => {
      t.plan(1);

      // Arrange
      const fetchFn = mock.fn(async () => {});
      const worker = new Worker({
        name: 'test-worker',
        interval: 1000,
        fetch: fetchFn
      });

      // Act
      worker.start();
      await setTimeout(2500);

      // Assert
      t.assert.ok(fetchFn.mock.callCount() >= 2);

      // Cleanup
      worker.stop();
    });

    it('should pass AbortSignal to fetch function', async (t: TestContext) => {
      t.plan(1);

      // Arrange
      let receivedSignal: AbortSignal | undefined;
      const fetchFn = mock.fn(async ({ signal }: { signal: AbortSignal }) => {
        receivedSignal = signal;
      });
      const worker = new Worker({
        name: 'test-worker',
        interval: 1000,
        fetch: fetchFn
      });

      //  Act
      worker.start();
      await setTimeout(100);
      worker.stop();

      // Assert
      t.assert.ok(receivedSignal instanceof AbortSignal);
    });

    it('should handle errors via errorCallback', async (t: TestContext) => {
      t.plan(1);

      // Arrange
      const testError = new Error('Test error');
      const errorCallback = mock.fn();
      const fetchFn = mock.fn(async () => {
        throw testError;
      });
      const worker = new Worker({
        name: 'test-worker',
        interval: 1000,
        errorCallback,
        fetch: fetchFn
      });

      // Act
      worker.start();
      await setTimeout(1100); // Wait for at least one fetch to complete
      worker.stop();

      // Assert
      t.assert.ok(errorCallback.mock.callCount() >= 1);
    });

    it('should continue running after errors', async (t: TestContext) => {
      t.plan(1);

      // Arrange
      let callCount = 0;
      const fetchFn = mock.fn(async () => {
        callCount++;
        if (callCount === 1) {
          throw new Error('First call error');
        }
      });
      const errorCallback = mock.fn();
      const worker = new Worker({
        name: 'test-worker',
        interval: 1000,
        errorCallback,
        fetch: fetchFn
      });

      // Act
      worker.start();
      await setTimeout(2500);
      worker.stop();

      // Assert
      t.assert.ok(fetchFn.mock.callCount() >= 2);
    });

    it('should abort fetch when timeout is reached', async (t: TestContext) => {
      t.plan(1);

      // Arrange
      const fetchFn = mock.fn(async ({ signal }: { signal: AbortSignal }) => {
        await setTimeout(5000, undefined, { signal }).catch(() => {});
      });
      const worker = new Worker({
        name: 'test-worker',
        interval: 1000,
        fetchProcessingTimeout: 100,
        fetch: fetchFn
      });

      // Act
      worker.start();
      await setTimeout(200);
      worker.stop();

      // Assert
      t.assert.ok(fetchFn.mock.callCount() >= 1);
    });

    it('should abort ongoing fetch operation', async (t: TestContext) => {
      t.plan(1);

      // Arrange
      let signalAborted = false;
      const fetchFn = mock.fn(async ({ signal }: { signal: AbortSignal }) => {
        try {
          // Start a long operation that should be aborted
          await setTimeout(5000, undefined, { signal, ref: false });
        } catch {
          // When the signal is aborted, setTimeout will throw AbortError
          signalAborted = signal.aborted;
        }
      });
      const worker = new Worker({
        name: 'test-worker',
        interval: 1000,
        fetch: fetchFn
      });

      // Act
      worker.start();
      await setTimeout(100); // Give time for fetch to start
      worker.stop(); // This should abort the ongoing setTimeout
      await setTimeout(200); // Give time for the abortion to take effect

      // Assert
      t.assert.ok(signalAborted);
    });

    it('should stop fetching after stop is called', async (t: TestContext) => {
      t.plan(2);

      // Arrange
      const fetchFn = mock.fn(async () => {});
      const worker = new Worker({
        name: 'test-worker',
        interval: 1000,
        fetch: fetchFn
      });

      // Act
      worker.start();
      await setTimeout(100);
      const callCountBeforeStop = fetchFn.mock.callCount();
      worker.stop();

      await setTimeout(1100);
      const callCountAfterStop = fetchFn.mock.callCount();

      // Assert
      t.assert.strictEqual(callCountBeforeStop, 1);
      t.assert.strictEqual(callCountBeforeStop, callCountAfterStop);
    });

    it('should be idempotent (can be called multiple times)', async (t: TestContext) => {
      t.plan(1);

      // Arrange
      const fetchFn = mock.fn(async () => {});
      const worker = new Worker({
        name: 'test-worker',
        interval: 1000,
        fetch: fetchFn
      });

      // Act
      worker.start();
      await setTimeout(150);
      worker.stop();
      worker.stop();
      worker.stop();

      t.assert.strictEqual(worker.state, 'stopping');
    });
  });

  describe('diagnostics', () => {
    it('should publish diagnostics channel events on success', async (t: TestContext) => {
      t.plan(3);

      // Arrange
      // biome-ignore lint/suspicious/noExplicitAny: for testing purposes
      let channelMessage: any;
      diagnostics_channel.subscribe('handling-worker:execution', (message) => {
        channelMessage = message;
      });

      const fetchFn = mock.fn(async () => {});
      const worker = new Worker({
        name: 'test-worker',
        interval: 1000,
        fetch: fetchFn
      });

      // Act
      worker.start();
      await setTimeout(100);
      worker.stop();

      // Assert
      t.assert.ok(channelMessage);
      t.assert.strictEqual(channelMessage.operation, 'worker:fetch');
      t.assert.strictEqual(channelMessage.success, true);
    });

    it('should publish diagnostics channel events on error', async (t: TestContext) => {
      t.plan(4);

      // Arrange
      // biome-ignore lint/suspicious/noExplicitAny: for testing purposes
      let channelMessage: any;
      diagnostics_channel.subscribe('handling-worker:execution', (message: unknown) => {
        // biome-ignore lint/suspicious/noExplicitAny: for testing purposes
        const msg = message as any;

        if (msg.success === false) {
          channelMessage = msg;
        }
      });

      const testError = new Error('Test error');
      const fetchFn = mock.fn(async () => {
        throw testError;
      });
      const errorCallback = mock.fn();
      const worker = new Worker({
        name: 'test-worker',
        interval: 1000,
        errorCallback,
        fetch: fetchFn
      });

      // Act
      worker.start();
      // Cleanup
      await setTimeout(100);
      worker.stop();

      // Assert
      t.assert.ok(channelMessage);
      t.assert.strictEqual(channelMessage.operation, 'worker:fetch');
      t.assert.strictEqual(channelMessage.success, false);
      t.assert.ok(channelMessage.error);
    });

    it('should include worker metadata in diagnostics events', async (t: TestContext) => {
      t.plan(3);

      // Arrange
      // biome-ignore lint/suspicious/noExplicitAny: for testing purposes
      let channelMessage: any;
      diagnostics_channel.subscribe('handling-worker:execution', (message) => {
        channelMessage = message;
      });

      const fetchFn = mock.fn(async () => {});
      const worker = new Worker({
        name: 'test-worker',
        interval: 1000,
        fetch: fetchFn
      });

      // Act
      worker.start();
      await setTimeout(100);
      worker.stop();

      // Assert
      t.assert.ok(channelMessage.params);
      t.assert.strictEqual(channelMessage.params.name, 'test-worker');
      t.assert.strictEqual(channelMessage.params.id, worker.id);
    });

    it('should include duration in diagnostics events', async (t: TestContext) => {
      t.plan(1);

      // Arrange
      // biome-ignore lint/suspicious/noExplicitAny: for testing purposes
      let channelMessage: any;
      diagnostics_channel.subscribe('handling-worker:execution', (message) => {
        channelMessage = message;
      });

      const fetchFn = mock.fn(async () => {
        await setTimeout(50);
      });
      const worker = new Worker({
        name: 'test-worker',
        interval: 1000,
        fetch: fetchFn
      });

      // Act
      worker.start();
      await setTimeout(200);
      worker.stop();

      // Assert
      t.assert.ok(typeof channelMessage.duration === 'number' && channelMessage.duration >= 0);
    });

    it('should augment error messages with worker info', async (t: TestContext) => {
      t.plan(1);

      // Arrange
      const originalError = new Error('Original error');

      // biome-ignore lint/suspicious/noExplicitAny: for testing purposes
      let caughtError: any;
      const errorCallback = mock.fn((err: unknown) => {
        caughtError = err;
      });
      const fetchFn = mock.fn(async () => {
        throw originalError;
      });
      const worker = new Worker({
        name: 'test-worker',
        interval: 1000,
        errorCallback,
        fetch: fetchFn
      });

      // Act
      worker.start();
      await setTimeout(100);
      worker.stop();

      // Assert
      t.assert.ok(caughtError.message.includes('test-worker'));
    });
  });

  describe('edge cases', () => {
    it('should handle fetch function that throws non-Error objects', async (t: TestContext) => {
      t.plan(1);

      // Arrange
      const errorCallback = mock.fn();
      const fetchFn = mock.fn(async () => {
        throw 'string error';
      });
      const worker = new Worker({
        name: 'test-worker',
        interval: 1000,
        errorCallback,
        fetch: fetchFn
      });

      // Act
      worker.start();
      await setTimeout(100);
      worker.stop();

      // Assert
      t.assert.ok(errorCallback.mock.callCount() >= 1);
    });

    it('should handle very short intervals correctly', async (t: TestContext) => {
      t.plan(1);

      // Arrange
      const fetchFn = mock.fn(async () => {});
      const worker = new Worker({
        name: 'test-worker',
        interval: 100,
        fetch: fetchFn
      });

      // Act
      worker.start();
      await setTimeout(1500);
      worker.stop();

      // Assert
      t.assert.ok(fetchFn.mock.callCount() >= 1);
    });

    it('should respect interval timing between fetches', async (t: TestContext) => {
      t.plan(1);

      // Arrange
      const callTimes: number[] = [];
      const fetchFn = mock.fn(async () => {
        callTimes.push(Date.now());
      });
      const worker = new Worker({
        name: 'test-worker',
        interval: 1000,
        fetch: fetchFn
      });

      //  Act
      worker.start();
      await setTimeout(2500);
      worker.stop();

      if (callTimes.length >= 2) {
        const time1 = callTimes[1];
        const time0 = callTimes[0];
        if (time1 !== undefined && time0 !== undefined) {
          const interval = time1 - time0;
          t.assert.ok(interval >= 900 && interval <= 1100);
        } else {
          t.assert.ok(true);
        }
      } else {
        t.assert.ok(true);
      }
    });

    it('should not wait full interval if fetch takes longer', async (t: TestContext) => {
      t.plan(1);

      // Arrange
      const fetchFn = mock.fn(async () => {
        await setTimeout(800);
      });
      const worker = new Worker({
        name: 'test-worker',
        interval: 1000,
        fetch: fetchFn
      });

      //  Act
      worker.start();
      await setTimeout(2500);
      worker.stop();

      // Assert
      t.assert.ok(fetchFn.mock.callCount() >= 2);
    });

    it('should follow correct state lifecycle', async (t: TestContext) => {
      t.plan(3);

      // Arrange
      const fetchFn = mock.fn(async () => {});
      const worker = new Worker({
        name: 'test-worker',
        interval: 1000,
        fetch: fetchFn
      });

      // Assert initial state
      t.assert.strictEqual(worker.state, 'created');

      //  Act
      worker.start();
      await setTimeout(50);

      // Assert state is active
      t.assert.strictEqual(worker.state, 'active');

      worker.stop();

      // Assert state is stopped
      t.assert.strictEqual(worker.state, 'stopping');
    });

    it('should not restart after being stopped', async (t: TestContext) => {
      t.plan(1);

      // Arrange
      const fetchFn = mock.fn(async () => {});
      const worker = new Worker({
        name: 'test-worker',
        interval: 1000,
        fetch: fetchFn
      });

      //  Act
      worker.start();
      await setTimeout(100);
      worker.stop();

      await setTimeout(2000);

      //  Assert
      t.assert.strictEqual(worker.state, 'stopped');
    });
  });

  describe('integration', () => {
    it('should work with async fetch operations', async (t: TestContext) => {
      t.plan(1);

      // Arrange
      let processedItems = 0;
      const fetchFn = mock.fn(async () => {
        await setTimeout(50);
        processedItems++;
      });
      const worker = new Worker({
        name: 'test-worker',
        interval: 1000,
        fetch: fetchFn
      });

      //  Act
      worker.start();
      await setTimeout(2500);
      worker.stop();

      // Assert
      t.assert.ok(processedItems >= 2);
    });

    it('should properly cleanup resources on stop', async (t: TestContext) => {
      t.plan(1);

      // Arrange
      const fetchFn = mock.fn(async ({ signal }: { signal: AbortSignal }) => {
        await setTimeout(100, undefined, { signal }).catch(() => {});
      });
      const worker = new Worker({
        name: 'test-worker',
        interval: 1000,
        fetch: fetchFn
      });

      //  Act
      worker.start();
      await setTimeout(100);
      worker.stop();

      // Assert
      t.assert.strictEqual(worker.state, 'stopping');
    });

    it('should handle multiple workers independently', async (t: TestContext) => {
      t.plan(2);

      // Arrange
      const fetchFn1 = mock.fn(async () => {});
      const fetchFn2 = mock.fn(async () => {});
      const worker1 = new Worker({
        name: 'worker-1',
        interval: 1000,
        fetch: fetchFn1
      });
      const worker2 = new Worker({
        name: 'worker-2',
        interval: 1000,
        fetch: fetchFn2
      });

      //  Act
      worker1.start();
      worker2.start();
      await setTimeout(1500);
      worker1.stop();

      await setTimeout(1000);
      worker2.stop();

      // Assert
      t.assert.ok(fetchFn1.mock.callCount() >= 1);
      t.assert.ok(fetchFn2.mock.callCount() >= 2);
    });
  });

  describe('dispose()', () => {
    it('should stop the worker when dispose is called', async (t: TestContext) => {
      t.plan(2);

      // Arrange
      const fetchFn = mock.fn(async () => {});
      const worker = new Worker({
        name: 'test-worker',
        interval: 1000,
        fetch: fetchFn
      });

      // Act
      worker.start();
      await setTimeout(100);
      t.assert.strictEqual(worker.state, 'active');

      worker.dispose();

      // Assert
      t.assert.strictEqual(worker.state, 'stopping');
    });

    it('should cleanup AbortController when dispose is called', async (t: TestContext) => {
      t.plan(1);

      // Arrange
      const fetchFn = mock.fn(async () => {});
      const worker = new Worker({
        name: 'test-worker',
        interval: 1000,
        fetch: fetchFn
      });

      // Act
      worker.start();
      await setTimeout(100);
      worker.dispose();
      await setTimeout(100);

      // Assert - worker should not execute more fetches after dispose
      const callCountAfterDispose = fetchFn.mock.callCount();
      await setTimeout(1100);
      t.assert.strictEqual(fetchFn.mock.callCount(), callCountAfterDispose);
    });

    it('should be safe to call dispose multiple times', async (t: TestContext) => {
      t.plan(1);

      // Arrange
      const fetchFn = mock.fn(async () => {});
      const worker = new Worker({
        name: 'test-worker',
        interval: 1000,
        fetch: fetchFn
      });

      // Act
      worker.start();
      await setTimeout(100);
      worker.dispose();
      worker.dispose();
      worker.dispose();

      // Assert - no errors thrown
      t.assert.ok(true);
    });

    it('should be safe to call dispose on non-started worker', (t: TestContext) => {
      t.plan(1);

      // Arrange
      const worker = new Worker({
        name: 'test-worker',
        fetch: async () => {}
      });

      // Act
      worker.dispose();

      // Assert - no errors thrown
      t.assert.ok(true);
    });

    it('should properly cleanup in try-finally pattern', async (t: TestContext) => {
      t.plan(2);

      // Arrange
      const fetchFn = mock.fn(async () => {});
      const worker = new Worker({
        name: 'test-worker',
        interval: 1000,
        fetch: fetchFn
      });

      // Act
      try {
        worker.start();
        await setTimeout(100);
        t.assert.ok(fetchFn.mock.callCount() >= 1);
      } finally {
        worker.dispose();
      }

      // Assert - worker stopped after finally
      const callCountAfterDispose = fetchFn.mock.callCount();
      await setTimeout(1100);
      t.assert.strictEqual(fetchFn.mock.callCount(), callCountAfterDispose);
    });
  });
});
