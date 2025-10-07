import { setTimeout } from 'node:timers/promises';
import { randomUUID, type UUID } from 'node:crypto';
import type { WorkerOptions } from './definitions.js';
import { DEFAULT_INTERVAL } from './constants.js';
import { channels } from './channels.js';

/**
 * Possible states of a Worker instance during its lifecycle.
 *
 * @enum {string}
 *
 * @property {string} created - Worker is created but not started yet. Initial state.
 * @property {string} active - Worker is running and actively fetching data at intervals.
 * @property {string} stopping - Worker is in the process of stopping. Waiting for current fetch to complete.
 * @property {string} stopped - Worker has completely stopped. No more fetch operations will occur.
 *
 * @example
 * ```typescript
 * const worker = new Worker(options);
 * console.log(worker.state); // 'created'
 *
 * await worker.start();
 * console.log(worker.state); // 'active'
 *
 * worker.stop();
 * console.log(worker.state); // 'stopping' then eventually 'stopped'
 * ```
 */
const WORKER_STATES = {
  created: 'created',
  active: 'active',
  stopping: 'stopping',
  stopped: 'stopped'
} as const;

/**
 * Type representing possible worker states.
 */
type WorkerState = (typeof WORKER_STATES)[keyof typeof WORKER_STATES];

/**
 * Worker class to perform recurring tasks at specified intervals.
 *
 * The Worker class allows you to define a task (fetch function) that will be executed
 * at regular intervals. It supports starting and stopping the task gracefully, with
 * proper handling of ongoing operations using AbortController.
 *
 * Key features:
 * - Configurable interval (minimum 1000ms)
 * - Optional timeout for fetch operations
 * - Error handling via callback
 * - Unique identifier for each worker instance
 * - State management (created, active, stopping, stopped)
 *
 * @see {@link WorkerOptions} for configuration options.
 */
export class Worker {
  /**
   * AbortController to cancel the current fetch task.
   * This is used when stopping the worker to abort any ongoing fetch operation
   * and to abort the interval timer between fetch operations.
   *
   * @private
   */
  #cancelTask: AbortController | undefined;

  /**
   * Timestamp (in milliseconds since epoch) when the worker instance was created.
   * Useful for tracking worker uptime and debugging purposes.
   *
   * @readonly
   *
   * @example
   * ```typescript
   * const worker = new Worker(options);
   * const uptime = Date.now() - worker.createdOn;
   * console.log(`Worker has been alive for ${uptime}ms`);
   * ```
   */
  readonly createdOn = Date.now();

  /**
   * Callback to handle errors thrown by the fetch function.
   * If no custom callback is provided, errors are logged to the console.
   *
   * @private
   * @default console.error
   */
  readonly #errorCallback: (err: unknown) => void = (err) => {
    console.error('Unhandled error in Worker:', err);
  };

  /**
   * Timeout in milliseconds for the fetch function to complete.
   * If the fetch function does not complete within this time, it will be aborted
   * via the AbortSignal passed to the fetch function.
   *
   * @private
   */
  readonly #fetchProcessingTimeout: number | undefined;

  /**
   * Interval in milliseconds between fetch calls.
   * This value is enforced to be at least 1000ms to prevent excessive polling.
   *
   * @private
   * @minimum 1000
   * @default 1000
   */
  readonly #interval: number = DEFAULT_INTERVAL;

  /**
   * Unique identifier (UUID v4) for this worker instance.
   * Generated at construction time and remains constant throughout the worker's lifetime.
   * Useful for tracking and debugging multiple workers.
   *
   * @readonly
   *
   * @example
   * ```typescript
   * const worker = new Worker(options);
   * console.log(worker.id); // '550e8400-e29b-41d4-a716-446655440000'
   * ```
   */
  readonly id: UUID;

  /**
   * Current state of the worker in its lifecycle.
   * Transitions: created → active → stopping → stopped
   *
   * @see {@link WORKER_STATES} for possible values
   * @default 'created'
   *
   * @example
   * ```typescript
   * const worker = new Worker(options);
   * console.log(worker.state); // 'created'
   * worker.start();
   * console.log(worker.state); // 'active'
   * ```
   */
  state: WorkerState = WORKER_STATES.created;

  /**
   * Internal flag indicating if the worker is in the process of stopping.
   * Used to break the fetch loop and prevent new fetch operations.
   *
   * @private
   * @default false
   */
  #stopping = false;

  /**
   * Creates a new Worker instance.
   *
   * The constructor validates all provided options and sets up the worker with
   * default values where appropriate. The worker starts in the 'created' state
   * and must be explicitly started using the start() method.
   *
   * @param options - Configuration options for the worker
   * @param options.name - Name of the worker for identification
   * @param options.fetch - Function to execute at each interval
   * @param options.interval - Optional interval in milliseconds (min: 1000, default: 1000)
   * @param options.errorCallback - Optional error handler (default: console.error)
   * @param options.fetchProcessingTimeout - Optional timeout for fetch operations (default: infinity)
   *
   * @throws {TypeError} If options is not an object
   * @throws {TypeError} If options.fetch is not a function
   * @throws {TypeError} If options.interval is not a non-negative integer
   * @throws {TypeError} If options.errorCallback is not a function
   * @throws {TypeError} If options.fetchProcessingTimeout is not a non-negative integer
   *
   * @example
   * ```typescript
   * const worker = new Worker({
   *   name: 'background-task',
   *   interval: 2000,
   *   fetch: async ({ signal }) => {
   *     await performTask({ signal });
   *   }
   * });
   * ```
   */
  constructor(private readonly options: Readonly<WorkerOptions>) {
    if (options) {
      if (typeof options !== 'object') {
        throw new TypeError('Worker options must be an object');
      }

      if (options.interval) {
        if (
          typeof options.interval !== 'number' ||
          !Number.isInteger(options.interval) ||
          options.interval < 0
        ) {
          throw new TypeError('Worker options.interval must be a non-negative integer');
        }

        this.#interval = Math.max(DEFAULT_INTERVAL, options.interval);
      }

      if (options.fetchProcessingTimeout) {
        if (
          typeof options.fetchProcessingTimeout !== 'number' ||
          !Number.isInteger(options.fetchProcessingTimeout) ||
          options.fetchProcessingTimeout < 0
        ) {
          throw new TypeError(
            'Worker options.fetchProcessingTimeout must be a non-negative integer'
          );
        }

        this.#fetchProcessingTimeout = options.fetchProcessingTimeout;
      }

      if (!options.fetch || typeof options.fetch !== 'function') {
        throw new TypeError('Worker options.fetch must be a function');
      }

      if (options.errorCallback) {
        if (typeof options.errorCallback !== 'function') {
          throw new TypeError('Worker.errorCallback to be a function');
        }

        this.#errorCallback = options.errorCallback;
      }
    }

    this.id = randomUUID({ disableEntropyCache: true });
  }

  /**
   * Internal method that runs the fetch loop.
   * This method is called by start() and continues to execute the fetch function
   * at the configured interval until stop() is called.
   *
   * It handles timing, cancellation, and error reporting.
   *
   * @private
   * @async
   * @returns {Promise<void>} Resolves when the worker has fully stopped.
   */
  async #startWorker(): Promise<void> {
    this.state = WORKER_STATES.active;

    while (this.#stopping === false) {
      const cancelTimeout = new AbortController();
      this.#cancelTask = new AbortController();

      const start = performance.now();

      const timeout = async (timeoutInMs?: number): Promise<void> => {
        if (timeoutInMs === undefined) {
          // Return a promise that never resolves, so the race is won by fetch()
          return new Promise(() => {});
        }

        try {
          await setTimeout(timeoutInMs, undefined, { signal: cancelTimeout.signal, ref: false });
          this.#cancelTask?.abort();
        } catch {
          // Ignore rejections here
        }
      };

      try {
        await Promise.race([
          timeout(this.#fetchProcessingTimeout),
          this.options.fetch({ signal: this.#cancelTask.signal })
        ]);

        channels.worker.publish({
          operation: 'worker:fetch',
          params: { id: this.id, name: this.options.name },
          duration: performance.now() - start,
          success: true
        });
      } catch (err) {
        channels.worker.publish({
          operation: 'worker:fetch',
          params: { id: this.id, name: this.options.name },
          duration: performance.now() - start,
          success: false,
          error: Error.isError(err) ? err.message : String(err)
        });

        if (Error.isError(err)) {
          err.message = `${err.message} (WorkName: ${this.options.name}, Worker: ${this.id})`;
        }

        this.#errorCallback(err);
      } finally {
        cancelTimeout.abort();
      }

      const elapsed = performance.now() - start;

      if (!this.#stopping && this.#interval - elapsed > 100) {
        try {
          await setTimeout(this.#interval - elapsed, undefined, {
            signal: this.#cancelTask.signal,
            ref: false
          });
        } catch {
          // AbortError is expected when stopping the worker
        }
      }
    }

    this.state = WORKER_STATES.stopped;
  }

  /**
   *  Starts the worker if it is not already active.
   * If the worker is already running, this method has no effect.
   *
   * @example
   * ```typescript
   * const worker = new Worker(options);
   * worker.start(); // Starts the worker
   * worker.start(); // No effect, worker is already running
   * ```
   *
   * @see {@link stop} to stop the worker gracefully.
   */
  start(): void {
    if (this.state !== WORKER_STATES.active) {
      void this.#startWorker().catch((err) => {
        this.#errorCallback(err);
      });
    }
  }

  /**
   * Stops the worker gracefully.
   * This method sets the stopping flag and aborts any ongoing fetch operation.
   * The worker will transition to 'stopping' state and eventually to 'stopped' state.
   *
   * @example
   * ```typescript
   * const worker = new Worker(options);
   * worker.start();
   * // Later...
   * worker.stop();
   * ```
   */
  stop(): void {
    this.#stopping = true;
    this.state = WORKER_STATES.stopping;

    this.#cancelTask?.abort();
  }
}
