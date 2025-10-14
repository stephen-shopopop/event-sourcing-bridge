import { describe, it, type TestContext, beforeEach } from 'node:test';
import { SQLiteConnector } from '../src/library/sqlite-connector.js';

describe('SQLiteConnector', () => {
  beforeEach(() => {
    // Reset singleton instance before each test
    // @ts-expect-error - Accessing private static field for testing
    SQLiteConnector._instance = undefined;
  });

  describe('getInstance', () => {
    it('should create a singleton instance with default path', (t: TestContext) => {
      t.plan(2);

      // Act
      const instance = SQLiteConnector.getInstance();

      // Assert
      t.assert.ok(instance);
      t.assert.ok(instance instanceof SQLiteConnector);
    });

    it('should return the same instance on multiple calls', (t: TestContext) => {
      t.plan(1);

      // Act
      const instance1 = SQLiteConnector.getInstance();
      const instance2 = SQLiteConnector.getInstance();

      // Assert
      t.assert.strictEqual(instance1, instance2);
    });

    it('should create instance with custom path', (t: TestContext) => {
      t.plan(1);

      // Act
      const instance = SQLiteConnector.getInstance('/tmp/test.db');

      // Assert
      t.assert.ok(instance);
    });

    it('should create instance with Buffer path', (t: TestContext) => {
      t.plan(1);

      // Arrange
      const bufferPath = Buffer.from('/tmp/test.db');

      // Act
      const instance = SQLiteConnector.getInstance(bufferPath);

      // Assert
      t.assert.ok(instance);
    });

    it('should create instance with URL path', (t: TestContext) => {
      t.plan(1);

      // Arrange
      const urlPath = new URL('file:///tmp/test.db');

      // Act
      const instance = SQLiteConnector.getInstance(urlPath);

      // Assert
      t.assert.ok(instance);
    });

    it('should accept custom timeout value', (t: TestContext) => {
      t.plan(1);

      // Act
      const instance = SQLiteConnector.getInstance(':memory:', 5000);

      // Assert
      t.assert.ok(instance);
    });

    it('should ignore parameters on subsequent calls (singleton behavior)', (t: TestContext) => {
      t.plan(1);

      // Act
      const instance1 = SQLiteConnector.getInstance(':memory:', 1000);
      const instance2 = SQLiteConnector.getInstance('/different/path.db', 5000);

      // Assert - should return same instance regardless of new parameters
      t.assert.strictEqual(instance1, instance2);
    });
  });

  describe('createConnection', () => {
    it('should create a valid DatabaseSync connection', (t: TestContext) => {
      t.plan(1);

      // Arrange
      const connector = SQLiteConnector.getInstance(':memory:');

      // Act
      const db = connector.createConnection();

      // Assert
      t.assert.ok(db);

      // Cleanup
      db.close();
    });

    it('should create independent connections for in-memory databases', (t: TestContext) => {
      t.plan(3);

      // Arrange
      const connector = SQLiteConnector.getInstance(':memory:');

      // Act - Create first connection and insert data
      const db1 = connector.createConnection();
      db1.exec('CREATE TABLE test (id INTEGER PRIMARY KEY, value TEXT)');
      db1.exec("INSERT INTO test (value) VALUES ('test1')");

      // Create second connection
      const db2 = connector.createConnection();

      // Assert - both connections are valid
      t.assert.ok(db1);
      t.assert.ok(db2);

      // Each in-memory database is independent - table won't exist in db2
      const stmt = db2.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='test'");
      const result = stmt.all();

      t.assert.equal(result.length, 0);

      // Cleanup
      db1.close();
      db2.close();
    });

    it('should apply timeout parameter to connection', (t: TestContext) => {
      t.plan(1);

      // Arrange
      const connector = SQLiteConnector.getInstance(':memory:', 3000);

      // Act
      const db = connector.createConnection();

      // Assert - connection should be created successfully with timeout
      t.assert.ok(db);

      // Cleanup
      db.close();
    });
  });
});
