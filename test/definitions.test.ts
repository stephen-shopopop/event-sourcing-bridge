import { describe, it, type TestContext } from 'node:test';
import type { WorkerOptions } from '../src/index.js';

describe('WorkerOptions type definition', () => {
  it('should accept valid WorkerOptions with all required fields', (t: TestContext) => {
    t.plan(2);

    // Act
    const validOptions: WorkerOptions = {
      name: 'test-worker',
      fetch: async ({ signal }) => {
        t.assert.ok(signal instanceof AbortSignal);
      }
    };

    // Assert
    t.assert.equal(validOptions.name, 'test-worker');
    t.assert.equal(typeof validOptions.fetch, 'function');
  });

  it('should accept WorkerOptions with optional errorCallback', (t: TestContext) => {
    t.plan(1);

    // Act
    const options: WorkerOptions = {
      name: 'test-worker',
      fetch: async () => {},
      errorCallback: (err) => {
        console.error('Error:', err);
      }
    };

    // Assert
    t.assert.equal(typeof options.errorCallback, 'function');
  });

  it('should accept WorkerOptions with optional interval', (t: TestContext) => {
    t.plan(1);

    // Act
    const options: WorkerOptions = {
      name: 'test-worker',
      fetch: async () => {},
      interval: 5000
    };

    // Assert
    t.assert.equal(options.interval, 5000);
  });

  it('should accept WorkerOptions with optional fetchProcessingTimeout', (t: TestContext) => {
    t.plan(1);

    // Act
    const options: WorkerOptions = {
      name: 'test-worker',
      fetch: async () => {},
      fetchProcessingTimeout: 30000
    };

    // Assert
    t.assert.equal(options.fetchProcessingTimeout, 30000);
  });

  it('should accept WorkerOptions with all optional fields', (t: TestContext) => {
    t.plan(5);

    // Act
    const options: WorkerOptions = {
      name: 'test-worker',
      fetch: async () => {},
      errorCallback: (err) => console.error(err),
      interval: 2000,
      fetchProcessingTimeout: 15000
    };

    // Assert
    t.assert.equal(options.name, 'test-worker');
    t.assert.equal(options.interval, 2000);
    t.assert.equal(options.fetchProcessingTimeout, 15000);
    t.assert.equal(typeof options.fetch, 'function');
    t.assert.equal(typeof options.errorCallback, 'function');
  });
});
