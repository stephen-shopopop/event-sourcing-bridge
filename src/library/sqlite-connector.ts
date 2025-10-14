import type { DatabaseSyncOptions, DatabaseSync } from 'node:sqlite';
import type { Path } from './definitions.js';
import { createRequire } from 'node:module';

/**
 * Creates a require function scoped to the current module's URL.
 * This enables CommonJS-style require() in ESM modules.
 *
 * @const {Function} require - The created require function for dynamic imports
 */
const require = createRequire(import.meta.url);

/**
 * SQLiteConnector implements a singleton pattern for SQLite database connections.
 * This class manages database connections and ensures only one instance exists per application.
 *
 * ## Architecture Overview
 *
 * ```
 * ┌─────────────────────────────────────────────────────────────┐
 * │                    Application Layer                        │
 * │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
 * │  │ Service1 │  │ Service2 │  │ Service3 │  │ ServiceN │   │
 * │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
 * └───────┼─────────────┼─────────────┼─────────────┼──────────┘
 *         │             │             │             │
 *         └─────────────┴─────────────┴─────────────┘
 *                          │
 *                          ▼
 *         ┌────────────────────────────────────────┐
 *         │      SQLiteConnector (Singleton)       │
 *         │  ┌──────────────────────────────────┐  │
 *         │  │  getInstance(path, timeout)      │  │
 *         │  │  • Ensures single instance       │  │
 *         │  │  • Stores path & timeout config  │  │
 *         │  └──────────────┬───────────────────┘  │
 *         │                 │                       │
 *         │  ┌──────────────▼───────────────────┐  │
 *         │  │  createConnection()              │  │
 *         │  │  • Creates new DatabaseSync      │  │
 *         │  │  • Each call = new connection    │  │
 *         │  │  • Independent transactions      │  │
 *         │  └──────────────┬───────────────────┘  │
 *         └─────────────────┼──────────────────────┘
 *                           │
 *         ┌─────────────────┴──────────────────┐
 *         │                                    │
 *         ▼                                    ▼
 * ┌──────────────┐                    ┌──────────────┐
 * │ DatabaseSync │                    │ DatabaseSync │
 * │ Connection 1 │                    │ Connection 2 │
 * │  ┌────────┐  │                    │  ┌────────┐  │
 * │  │ File/  │  │                    │  │ File/  │  │
 * │  │:memory:│  │                    │  │:memory:│  │
 * │  └────────┘  │                    │  └────────┘  │
 * └──────────────┘                    └──────────────┘
 *
 * Note: For :memory: databases, each connection creates
 *       an independent in-memory database instance.
 * ```
 *
 * ## Design Patterns
 *
 * - **Singleton Pattern**: Only one SQLiteConnector instance per application
 * - **Factory Pattern**: createConnection() acts as a factory for DatabaseSync instances
 * - **Open/Closed Principle**: Extensible for advanced usage without modifying core logic
 *
 * ## Use Cases
 *
 * - **Queue Management**: Single persistent queue across application
 * - **Cache Storage**: Centralized cache with SQLite backend
 * - **Job Scheduling**: Event sourcing and task management
 * - **Development**: In-memory database for testing
 *
 * ## Advanced Usage
 *
 * The singleton is exposed to allow advanced developers to perform direct reads, diagnostics,
 * or custom actions on the underlying SQLite database, while ensuring only one connector instance exists.
 *
 * **Warning:**
 * - Multiple connections to the same file can be created via `createConnection()`
 * - Each connection is independent (separate transactions, locks, etc.)
 * - Custom queries or writes may impact cache integrity or performance
 * - Always close connections when done to prevent resource leaks
 * - Use with caution and document your advanced usages
 *
 * @class SQLiteConnector
 * @implements {Singleton Pattern}
 *
 * @example Basic Usage
 * ```typescript
 * import { SQLiteConnector } from './sqlite-connector';
 *
 * // Get singleton instance with in-memory database
 * const connector = SQLiteConnector.getInstance(':memory:');
 *
 * // Create a connection
 * const db = connector.createConnection();
 *
 * // Use the database
 * db.exec('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)');
 * db.exec("INSERT INTO users (name) VALUES ('Alice')");
 *
 * // Clean up
 * db.close();
 * ```
 *
 * @example With File-based Database
 * ```typescript
 * import { SQLiteConnector } from './sqlite-connector';
 *
 * // Get singleton with file path and timeout
 * const connector = SQLiteConnector.getInstance('./data/app.db', 5000);
 *
 * // Create connection
 * const db = connector.createConnection();
 *
 * // Use database...
 * const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
 * const user = stmt.get(1);
 *
 * db.close();
 * ```
 *
 * @example Multiple Connections (Advanced)
 * ```typescript
 * const connector = SQLiteConnector.getInstance('./shared.db');
 *
 * // Connection 1 - Read operations
 * const readDb = connector.createConnection();
 * const users = readDb.prepare('SELECT * FROM users').all();
 * readDb.close();
 *
 * // Connection 2 - Write operations
 * const writeDb = connector.createConnection();
 * writeDb.exec('INSERT INTO users (name) VALUES ("Bob")');
 * writeDb.close();
 * ```
 *
 * @example Using Buffer or URL as Path
 * ```typescript
 * // Using Buffer
 * const bufferPath = Buffer.from('./data/cache.db');
 * const connector1 = SQLiteConnector.getInstance(bufferPath);
 *
 * // Using URL
 * const urlPath = new URL('file:///var/data/app.db');
 * const connector2 = SQLiteConnector.getInstance(urlPath);
 * ```
 */
export class SQLiteConnector {
  private static _instance: SQLiteConnector;

  private constructor(
    private readonly path: Path,
    private readonly timeout?: number
  ) {}

  /**
   * Returns the singleton instance of SQLiteConnector.
   * If an instance doesn't exist, creates one with the given parameters.
   * Once created, subsequent calls return the same instance regardless of parameters.
   *
   * @param {Path} [path=':memory:'] - The path to the SQLite database file.
   *   - String path: './data/app.db', '/var/lib/db.sqlite'
   *   - Buffer: Buffer.from('/path/to/db')
   *   - URL: new URL('file:///path/to/db')
   *   - Special: ':memory:' for in-memory database (default)
   *
   * @param {number} [timeout] - Optional timeout value in milliseconds for database operations.
   *   If not specified, operations may block indefinitely.
   *
   * @returns {SQLiteConnector} The singleton SQLiteConnector instance
   *
   * @static
   * @public
   *
   * @example Get instance with default in-memory database
   * ```typescript
   * const connector = SQLiteConnector.getInstance();
   * ```
   *
   * @example Get instance with file path
   * ```typescript
   * const connector = SQLiteConnector.getInstance('./data/queue.db');
   * ```
   *
   * @example Get instance with timeout
   * ```typescript
   * const connector = SQLiteConnector.getInstance(':memory:', 5000);
   * ```
   *
   * @example Singleton behavior - second call returns same instance
   * ```typescript
   * const first = SQLiteConnector.getInstance('./db1.db');
   * const second = SQLiteConnector.getInstance('./db2.db'); // Still points to db1.db
   * console.log(first === second); // true
   * ```
   */
  static getInstance(path: Path = ':memory:', timeout?: number): SQLiteConnector {
    if (!SQLiteConnector._instance) {
      SQLiteConnector._instance = new SQLiteConnector(path, timeout);
    }

    return SQLiteConnector._instance;
  }

  /**
   * Creates a new synchronous SQLite database connection.
   *
   * Each call to this method creates a new, independent database connection.
   * For file-based databases, multiple connections to the same file can coexist.
   * For in-memory databases (:memory:), each connection creates a separate, isolated database.
   *
   * **Important Notes:**
   * - Always close connections when done to prevent resource leaks
   * - Each connection has its own transaction context
   * - In-memory databases are isolated per connection
   * - File-based databases share the same underlying file
   *
   * @returns {DatabaseSync} A new DatabaseSync instance connected to the configured path
   *
   * @throws {Error} If the database connection cannot be established (e.g., file permissions, disk space)
   * @throws {TypeError} If the path or timeout configuration is invalid
   *
   * @public
   *
   * @example Create and use a connection
   * ```typescript
   * const connector = SQLiteConnector.getInstance(':memory:');
   * const db = connector.createConnection();
   *
   * try {
   *   db.exec('CREATE TABLE tasks (id INTEGER PRIMARY KEY, name TEXT)');
   *   db.exec("INSERT INTO tasks (name) VALUES ('Task 1')");
   *
   *   const tasks = db.prepare('SELECT * FROM tasks').all();
   *   console.log(tasks);
   * } finally {
   *   db.close(); // Always close the connection
   * }
   * ```
   *
   * @example Multiple independent connections
   * ```typescript
   * const connector = SQLiteConnector.getInstance('./shared.db');
   *
   * // Connection 1
   * const db1 = connector.createConnection();
   * db1.exec('BEGIN TRANSACTION');
   * db1.exec('INSERT INTO logs (message) VALUES ("Log from connection 1")');
   * // Transaction not yet committed
   *
   * // Connection 2 (independent)
   * const db2 = connector.createConnection();
   * const logs = db2.prepare('SELECT * FROM logs').all(); // Won't see uncommitted data from db1
   *
   * db1.exec('COMMIT');
   * db1.close();
   * db2.close();
   * ```
   *
   * @example Handling connection errors
   * ```typescript
   * const connector = SQLiteConnector.getInstance('/invalid/path/db.sqlite');
   *
   * try {
   *   const db = connector.createConnection();
   *   // Use database...
   *   db.close();
   * } catch (error) {
   *   console.error('Failed to create connection:', error);
   *   // Handle error appropriately
   * }
   * ```
   *
   * @see {@link https://nodejs.org/api/sqlite.html#class-databasesync | Node.js DatabaseSync Documentation}
   */
  createConnection(): DatabaseSync {
    const DatabaseSync = require('node:sqlite').DatabaseSync as new (
      path: Path,
      args: DatabaseSyncOptions
    ) => DatabaseSync;

    return new DatabaseSync(this.path, { timeout: this.timeout });
  }
}
