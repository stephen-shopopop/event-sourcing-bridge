import { describe, it, type TestContext } from 'node:test';
import type { WorkerOptions, Path, SQLiteQueueOptions } from '../src/index.js';

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

describe('Path type definition', () => {
  it('should accept string as Path', (t: TestContext) => {
    t.plan(1);

    // Act
    const path: Path = '/path/to/file.db';

    // Assert
    t.assert.equal(typeof path, 'string');
  });

  it('should accept Buffer as Path', (t: TestContext) => {
    t.plan(1);

    // Act
    const path: Path = Buffer.from('/path/to/file.db');

    // Assert
    t.assert.ok(Buffer.isBuffer(path));
  });

  it('should accept URL as Path', (t: TestContext) => {
    t.plan(1);

    // Act
    const path: Path = new URL('file:///path/to/file.db');

    // Assert
    t.assert.ok(path instanceof URL);
  });

  it('should accept :memory: string for in-memory database', (t: TestContext) => {
    t.plan(1);

    // Act
    const path: Path = ':memory:';

    // Assert
    t.assert.equal(path, ':memory:');
  });

  it('should accept empty string as Path', (t: TestContext) => {
    t.plan(1);

    // Act
    const path: Path = '';

    // Assert
    t.assert.equal(path, '');
  });

  it('should accept relative path as string', (t: TestContext) => {
    t.plan(1);

    // Act
    const path: Path = './data/db.sqlite';

    // Assert
    t.assert.equal(typeof path, 'string');
  });

  it('should accept absolute path as string', (t: TestContext) => {
    t.plan(1);

    // Act
    const path: Path = '/var/lib/database.db';

    // Assert
    t.assert.equal(typeof path, 'string');
  });
});

describe('SQLiteQueueOptions type definition', () => {
  it('should accept empty object (all fields optional)', (t: TestContext) => {
    t.plan(1);

    // Act
    const options: SQLiteQueueOptions = {};

    // Assert
    t.assert.ok(typeof options === 'object');
  });

  it('should accept only filename', (t: TestContext) => {
    t.plan(1);

    // Act
    const options: SQLiteQueueOptions = {
      filename: '/path/to/database.db'
    };

    // Assert
    t.assert.equal(options.filename, '/path/to/database.db');
  });

  it('should accept only maxEntrySize', (t: TestContext) => {
    t.plan(1);

    // Act
    const options: SQLiteQueueOptions = {
      maxEntrySize: 1024 * 1024 * 100 // 100MB
    };

    // Assert
    t.assert.equal(options.maxEntrySize, 104857600);
  });

  it('should accept only timeout', (t: TestContext) => {
    t.plan(1);

    // Act
    const options: SQLiteQueueOptions = {
      timeout: 5000
    };

    // Assert
    t.assert.equal(options.timeout, 5000);
  });

  it('should accept all fields', (t: TestContext) => {
    t.plan(3);

    // Act
    const options: SQLiteQueueOptions = {
      filename: 'queue.db',
      maxEntrySize: 2 * 1024 * 1024 * 1024, // 2GB
      timeout: 3000
    };

    // Assert
    t.assert.equal(options.filename, 'queue.db');
    t.assert.equal(options.maxEntrySize, 2147483648);
    t.assert.equal(options.timeout, 3000);
  });

  it('should accept :memory: as filename', (t: TestContext) => {
    t.plan(1);

    // Act
    const options: SQLiteQueueOptions = {
      filename: ':memory:'
    };

    // Assert
    t.assert.equal(options.filename, ':memory:');
  });

  it('should accept undefined for optional fields', (t: TestContext) => {
    t.plan(3);

    // Act
    const options: SQLiteQueueOptions = {
      filename: undefined,
      maxEntrySize: undefined,
      timeout: undefined
    };

    // Assert
    t.assert.equal(options.filename, undefined);
    t.assert.equal(options.maxEntrySize, undefined);
    t.assert.equal(options.timeout, undefined);
  });

  it('should accept zero as maxEntrySize', (t: TestContext) => {
    t.plan(1);

    // Act
    const options: SQLiteQueueOptions = {
      maxEntrySize: 0
    };

    // Assert
    t.assert.equal(options.maxEntrySize, 0);
  });

  it('should accept zero as timeout', (t: TestContext) => {
    t.plan(1);

    // Act
    const options: SQLiteQueueOptions = {
      timeout: 0
    };

    // Assert
    t.assert.equal(options.timeout, 0);
  });

  it('should accept large maxEntrySize values', (t: TestContext) => {
    t.plan(1);

    // Act - 10GB
    const options: SQLiteQueueOptions = {
      maxEntrySize: 10 * 1024 * 1024 * 1024
    };

    // Assert
    t.assert.equal(options.maxEntrySize, 10737418240);
  });
});
