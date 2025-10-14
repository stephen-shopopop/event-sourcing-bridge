import type { DatabaseSync } from 'node:sqlite';
import type { SQLiteQueueOptions } from './definitions.js';
import { SQLiteConnector } from './sqlite-connector.js';

/**
 * The version number of the SQLite cache store implementation.
 * Used to track schema compatibility and migrations.
 * @constant
 * @type {number}
 */
const VERSION = 1;

/**
 * Maximum size in bytes for a cache entry (2GB)
 * @constant {number}
 */
const MAX_ENTRY_SIZE = 2 * 1000 * 1000 * 1000;

export class SQLiteQueueing<_Metadata extends object = Record<PropertyKey, unknown>> {
  /**
   * The SQLite database connection instance.
   * @private
   */
  #db: DatabaseSync;

  /**
   * Creates a new SQLiteQueueing instance.
   *
   * @param options - Configuration options for the SQLite queueing
   * @param options.filename - The filename for the SQLite database
   * @param options.timeout - The timeout value for database operations
   * @param options.maxEntrySize - Maximum size of a single cache entry in bytes (must be non-negative integer < 2GB)
   *
   * @throws {TypeError} When maxEntrySize is not a non-negative integer or exceeds 2GB
   * @throws {TypeError} When maxCount is not a non-negative integer
   *
   * @remarks
   * The constructor initializes the SQLite database with the following optimizations:
   * - WAL journal mode
   * - NORMAL synchronous mode
   * - Memory-based temp store
   * - Database optimization
   *
   * It also creates necessary tables and indexes for queue operations and prepares
   */
  constructor(options: Readonly<SQLiteQueueOptions> = {}) {
    const { filename, timeout, maxEntrySize } = options;

    if (maxEntrySize !== undefined) {
      if (typeof maxEntrySize !== 'number' || !Number.isInteger(maxEntrySize) || maxEntrySize < 0) {
        throw new TypeError('SQLiteQueue options.maxEntrySize must be a non-negative integer');
      }

      if (maxEntrySize > MAX_ENTRY_SIZE) {
        throw new TypeError('SQLiteQueue options.maxEntrySize must be less than 2gb');
      }

      // this.#maxEntrySize = maxEntrySize;
    }

    this.#db = SQLiteConnector.getInstance(filename, timeout).createConnection();

    this.#db.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = NORMAL;
      PRAGMA temp_store = memory;
      PRAGMA optimize;

      CREATE TABLE IF NOT EXISTS cache_v${VERSION} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value BUF NOT NULL,
        metadata BLOB NOT NULL,
        deleteAt INTEGER NOT NULL,
        cachedAt INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_cache_v${VERSION}_getValuesQuery ON cache_v${VERSION}(key, deleteAt);
      CREATE INDEX IF NOT EXISTS idx_cache_v${VERSION}_deleteByUrlQuery ON cache_v${VERSION}(deleteAt);
    `);
  }

  /**
   * Closes the SQLite database connection.
   * This method should be called when the cache store is no longer needed to free up resources.
   */
  close(): void {
    this.#db.close();
  }
}
