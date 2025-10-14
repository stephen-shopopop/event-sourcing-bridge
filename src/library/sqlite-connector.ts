import type { DatabaseSyncOptions, DatabaseSync } from 'node:sqlite';
import type { Path } from './definitions.js';
import { createRequire } from 'node:module';

/**
 * Creates a require function scoped to the current module's URL.
 * This enables CommonJS-style require() in ESM modules.
 * @const {Function} require - The created require function
 */
const require = createRequire(import.meta.url);

/**
 * SQLiteConnector implements a singleton pattern for SQLite database connections.
 * This class manages database connections and ensures only one instance exists for the cache.
 *
 * ## Advanced usage
 *
 * The singleton is exposed to allow advanced developers to perform direct reads, diagnostics,
 * or custom actions on the underlying SQLite database, while ensuring only one connection exists.
 *
 * **Warning:**
 * - Any direct use of the singleton must respect the single-connection policy (no parallel connections).
 * - Custom queries or writes may impact the cache's integrity or performance.
 * - Use with caution and always document your advanced usages in your codebase.
 *
 * This design follows the SOLID Open/Closed principle: the cache is extensible for advanced needs
 * without modifying its core logic, but remains safe for standard usage.
 *
 * @class SQLiteConnector
 *
 * @example
 * ```typescript
 * // Access the singleton for advanced operations (read-only or diagnostics)
 * const connector = SQLiteConnector.getInstance(':memory:');
 * const db = connector.createConnection();
 * // ...custom queries...
 * ```
 *
 * @property {SQLiteConnector} #instance - Private static instance of the connector
 * @property {Path} path - Path to the SQLite database file or ':memory:' for in-memory database
 * @property {number | undefined} timeout - Optional timeout value for database operations
 *
 * @throws {Error} If the SQLite database connection cannot be established
 */
export class SQLiteConnector {
  private static _instance: SQLiteConnector;

  private constructor(
    private readonly path: Path,
    private readonly timeout?: number
  ) {}

  /**
   * Returns a singleton instance of SQLiteConnector.
   * If an instance doesn't exist, creates one with the given parameters.
   *
   * @param path - The path to the SQLite database file. Defaults to ':memory:' for in-memory database.
   * @param timeout - Optional timeout value in milliseconds
   * @returns The singleton SQLiteConnector instance
   *
   * @example
   * ```ts
   * const connector = SQLiteConnector.getInstance('/path/to/db', 5000);
   * ```
   */
  static getInstance(path: Path = ':memory:', timeout?: number): SQLiteConnector {
    if (!SQLiteConnector._instance) {
      SQLiteConnector._instance = new SQLiteConnector(path, timeout);
    }

    return SQLiteConnector._instance;
  }

  /**
   * Creates a synchronous SQLite database connection.
   *
   * @returns {DatabaseSync} A new instance of DatabaseSync connected to the specified path
   * @throws {Error} If the database connection cannot be established
   */
  createConnection(): DatabaseSync {
    const DatabaseSync = require('node:sqlite').DatabaseSync as new (
      path: Path,
      args: DatabaseSyncOptions
    ) => DatabaseSync;

    return new DatabaseSync(this.path, { timeout: this.timeout });
  }
}
