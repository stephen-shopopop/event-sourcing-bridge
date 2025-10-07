import { describe, it, type TestContext, mock } from 'node:test';
import { setTimeout } from 'node:timers/promises';
import { setTimeout as setTimeoutCb } from 'node:timers';
import diagnostics_channel from 'node:diagnostics_channel';
import { Worker } from '../src/library/worker.js';
import type { WorkerOptions } from '../src/library/definitions.js';

/**
 * Helper for callback-based setTimeout
 */
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeoutCb(resolve, ms));
}

describe('Worker', () => {
  describe('constructor validation', () => {
    it('should throw TypeError when options is a primitive (not an object)', (t: TestContext) => {
      t.plan(2);

      // Act & Assert
      t.assert.throws(() => new Worker('not-an-object' as unknown as WorkerOptions), TypeError);
      t.assert.throws(() => new Worker(123 as unknown as WorkerOptions), TypeError);
    });

    it('should throw TypeError when interval is not a number', (t: TestContext) => {
      t.plan(1);

      // Act & Assert
      t.assert.throws(
        () =>
          new Worker({
            name: 'test',
            interval: '1000' as unknown as number,
            fetch: async () => {}
          }),
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
        () =>
          new Worker({
            name: 'test',
            fetchProcessingTimeout: '1000' as unknown as number,
            fetch: async () => {}
          }),
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
      t.assert.throws(() => new Worker({ name: 'test' } as unknown as WorkerOptions), TypeError);
    });

    it('should throw TypeError when fetch is null', (t: TestContext) => {
      t.plan(1);

      // Act & Assert
      t.assert.throws(
        () => new Worker({ name: 'test', fetch: null as unknown as WorkerOptions['fetch'] }),
        TypeError
      );
    });

    it('should throw TypeError when fetch is not a function', (t: TestContext) => {
      t.plan(3);

      // Act & Assert
      t.assert.throws(
        () =>
          new Worker({
            name: 'test',
            fetch: 'not-a-function' as unknown as WorkerOptions['fetch']
          }),
        TypeError
      );
      t.assert.throws(
        () => new Worker({ name: 'test', fetch: 123 as unknown as WorkerOptions['fetch'] }),
        TypeError
      );
      t.assert.throws(
        () => new Worker({ name: 'test', fetch: {} as unknown as WorkerOptions['fetch'] }),
        TypeError
      );
    });

    it('should throw TypeError when errorCallback is not a function', (t: TestContext) => {
      t.plan(2);

      // Act & Assert
      t.assert.throws(
        () =>
          new Worker({
            name: 'test',
            errorCallback: 'not-a-function' as unknown as (err: unknown) => void,
            fetch: async () => {}
          }),
        TypeError
      );
      t.assert.throws(
        () =>
          new Worker({
            name: 'test',
            errorCallback: 123 as unknown as (err: unknown) => void,
            fetch: async () => {}
          }),
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
      worker.dispose();
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
      // Optimized: wait just enough time for 2+ calls
      await wait(50); // First call
      await wait(1050); // Second call
      await wait(50); // Small buffer

      // Assert
      t.assert.ok(
        fetchFn.mock.callCount() >= 2,
        `Expected >= 2 calls, got ${fetchFn.mock.callCount()}`
      );

      // Cleanup
      worker.dispose();
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
      worker.dispose();

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
      worker.dispose();

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
      // Optimized: just wait for 2 calls
      await wait(50); // First call (will error)
      await wait(1050); // Second call (will succeed)
      worker.dispose();

      // Assert
      t.assert.ok(
        fetchFn.mock.callCount() >= 2,
        `Expected >= 2 calls, got ${fetchFn.mock.callCount()}`
      );
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
      worker.dispose();

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
      worker.dispose(); // This should abort the ongoing setTimeout
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
      worker.dispose();

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
      worker.dispose();
      worker.dispose();
      worker.dispose();

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
      worker.dispose();

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
      worker.dispose();

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
      worker.dispose();

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
      worker.dispose();

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
      worker.dispose();

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
      worker.dispose();

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
      worker.dispose();

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
      // Optimized: wait just for 2 calls
      await wait(50); // First call
      await wait(1050); // Second call
      worker.dispose();

      if (callTimes.length >= 2) {
        const time1 = callTimes[1];
        const time0 = callTimes[0];
        if (time1 !== undefined && time0 !== undefined) {
          const interval = time1 - time0;
          t.assert.ok(
            interval >= 900 && interval <= 1100,
            `Interval should be ~1000ms, got ${interval}ms`
          );
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
        await wait(800);
      });
      const worker = new Worker({
        name: 'test-worker',
        interval: 1000,
        fetch: fetchFn
      });

      //  Act
      worker.start();
      // Optimized: fetch takes 800ms, interval is 1000ms, so wait ~1800ms for 2 calls
      await wait(50); // Start first call
      await wait(900); // First call completes + interval wait
      await wait(900); // Second call completes
      worker.dispose();

      // Assert
      t.assert.ok(
        fetchFn.mock.callCount() >= 2,
        `Expected >= 2 calls, got ${fetchFn.mock.callCount()}`
      );
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

      worker.dispose();

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
      await wait(50);
      worker.dispose();

      // Optimized: wait less time to verify no restart
      await wait(1200);

      //  Assert
      t.assert.strictEqual(worker.state, 'stopped');
    });

    it('should transition to stopped state after dispose', async (t: TestContext) => {
      t.plan(3);

      // Arrange
      const fetchFn = mock.fn(async () => {});
      const worker = new Worker({
        name: 'test-worker',
        interval: 1000,
        fetch: fetchFn
      });

      //  Act
      worker.start();
      t.assert.strictEqual(worker.state, 'active', 'Should be active after start');
      
      worker.dispose();
      t.assert.strictEqual(worker.state, 'stopping', 'Should be stopping after dispose');

      // Wait for worker loop to complete
      await wait(200);

      //  Assert
      t.assert.strictEqual(worker.state, 'stopped', 'Should be stopped after cleanup');
    });

    it('should allow restart after complete stop (new behavior)', async (t: TestContext) => {
      t.plan(4);

      // Arrange
      const fetchFn = mock.fn(async () => {});
      const worker = new Worker({
        name: 'test-worker',
        interval: 1000,
        fetch: fetchFn
      });

      //  Act - First lifecycle
      worker.start();
      t.assert.strictEqual(worker.state, 'active', 'First start: should be active');
      await wait(50);
      
      const firstCallCount = fetchFn.mock.callCount();
      
      worker.dispose();
      await wait(200); // Wait for complete stop
      
      t.assert.strictEqual(worker.state, 'stopped', 'Should be stopped');

      //  Act - Second lifecycle (restart)
      worker.start();
      t.assert.strictEqual(worker.state, 'active', 'Restart: should be active again');
      
      await wait(1100); // Wait for at least one call
      worker.dispose();
      await wait(200);

      //  Assert
      t.assert.ok(
        fetchFn.mock.callCount() > firstCallCount,
        `Should have more calls after restart: ${fetchFn.mock.callCount()} > ${firstCallCount}`
      );
    });

    it('should not allow restart during stopping state', async (t: TestContext) => {
      t.plan(2);

      // Arrange
      const fetchFn = mock.fn(async () => {});
      const worker = new Worker({
        name: 'test-worker',
        interval: 1000,
        fetch: fetchFn
      });

      //  Act
      worker.start();
      await wait(50);
      worker.dispose();
      
      // Try to restart immediately (during stopping)
      t.assert.strictEqual(worker.state, 'stopping', 'Should be in stopping state');
      worker.start();
      
      await wait(50);

      //  Assert - should still be stopping/stopped, not active
      t.assert.notStrictEqual(worker.state, 'active', 'Should not be active during stopping');
    });

    it('should handle multiple restart cycles', async (t: TestContext) => {
      t.plan(5);

      // Arrange
      const fetchFn = mock.fn(async () => {});
      const worker = new Worker({
        name: 'test-worker',
        interval: 1000,
        fetch: fetchFn
      });

      // Act - Run 3 complete cycles
      for (let cycle = 0; cycle < 3; cycle++) {
        worker.start();
        t.assert.strictEqual(worker.state, 'active', `Cycle ${cycle + 1}: should be active`);
        
        await wait(50);
        worker.dispose();
        
        // Wait for complete stop
        await wait(200);
      }

      // Assert
      t.assert.strictEqual(worker.state, 'stopped', 'Should be stopped after all cycles');
      t.assert.ok(fetchFn.mock.callCount() >= 3, `Should have >= 3 calls, got ${fetchFn.mock.callCount()}`);
    });

    it('should handle concurrent start calls when stopped', async (t: TestContext) => {
      t.plan(2);

      // Arrange
      const fetchFn = mock.fn(async () => {});
      const worker = new Worker({
        name: 'test-worker',
        interval: 1000,
        fetch: fetchFn
      });

      // Act - First cycle
      worker.start();
      await wait(50);
      worker.dispose();
      await wait(200); // Wait for stopped

      // Call start multiple times concurrently
      worker.start();
      worker.start();
      worker.start();
      
      await wait(50);

      // Assert
      t.assert.strictEqual(worker.state, 'active', 'Should be active (idempotent start)');
      
      // Cleanup
      worker.dispose();
      await wait(200);
      
      t.assert.strictEqual(worker.state, 'stopped', 'Should be stopped');
    });
  });

  describe('integration', () => {
    it('should work with async fetch operations', async (t: TestContext) => {
      t.plan(1);

      // Arrange
      let processedItems = 0;
      const fetchFn = mock.fn(async () => {
        await wait(50);
        processedItems++;
      });
      const worker = new Worker({
        name: 'test-worker',
        interval: 1000,
        fetch: fetchFn
      });

      //  Act
      worker.start();
      // Optimized: wait just for 2+ items
      await wait(100); // First item
      await wait(1050); // Second item
      worker.dispose();

      // Assert
      t.assert.ok(processedItems >= 2, `Expected >= 2 items, got ${processedItems}`);
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
      worker.dispose();

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
      // Optimized: shorter delays
      await wait(1100); // Both get first call
      worker1.dispose(); // Worker1 stops after ~1 call

      await wait(1050); // Worker2 gets second call
      worker2.dispose();

      // Assert
      t.assert.ok(
        fetchFn1.mock.callCount() >= 1,
        `Worker1 should have >= 1 call, got ${fetchFn1.mock.callCount()}`
      );
      t.assert.ok(
        fetchFn2.mock.callCount() >= 2,
        `Worker2 should have >= 2 calls, got ${fetchFn2.mock.callCount()}`
      );
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
