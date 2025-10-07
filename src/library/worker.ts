import { setTimeout } from 'node:timers/promises';
import { randomUUID, type UUID } from 'node:crypto';

/**
 * Configuration options for creating a Worker instance.
 *
 * @example
 * ```typescript
 * const options: WorkerOptions = {
 *   name: 'data-fetcher',
 *   interval: 5000,
 *   fetch: async ({ signal }) => {
 *     const response = await fetch('https://api.example.com/data', { signal });
 *     await processData(await response.json());
 *   },
 *   errorCallback: (err) => logger.error(err),
 *   fetchProcessingTimeout: 30000
 * };
 * ```
 */
type WorkerOptions = {
  /**
   * Optional callback to handle errors thrown by the fetch function.
   * If not provided, errors are logged to the console.
   *
   * @param err - The error caught during fetch execution
   *
   * @default console.error
   *
   * @example
   * ```typescript
   * errorCallback: (err) => {
   *   logger.error('Worker failed:', err);
   *   metrics.increment('worker.errors');
   * }
   * ```
   */
  errorCallback?: (err: unknown) => void;
  /**
   * Interval in milliseconds between fetch calls.
   * The interval is measured from the start of one fetch to the start of the next.
   * If a fetch takes longer than the interval, the next fetch starts immediately.
   *
   * @minimum 1000
   * @default 1000
   *
   * @example
   * ```typescript
   * interval: 5000 // Fetch every 5 seconds
   * ```
   */
  interval?: number;
  /**
   * Fetch function to be called at each interval. Must return a Promise.
   * The function receives an AbortSignal that should be used to cancel the operation
   * when the worker is stopped or when the fetchProcessingTimeout is reached.
   *
   * @param options - Object containing the abort signal
   * @param options.signal - AbortSignal to handle cancellation
   * @returns Promise that resolves when the fetch operation is complete
   *
   * @example
   * ```typescript
   * fetch: async ({ signal }) => {
   *   const data = await fetchData({ signal });
   *   await processData(data);
   * }
   * ```
   */
  fetch: ({ signal }: { signal: AbortSignal }) => Promise<void>;
  /**
   * Name of the worker for identification purposes.
   * This name is included in error messages and can be used for logging and debugging.
   *
   * @example
   * ```typescript
   * name: 'email-queue-processor'
   * ```
   */
  name: string;
  /**
   * Optional timeout for the fetch function in milliseconds.
   * If the fetch function does not complete within this time, it will be aborted
   * using the AbortSignal passed to the fetch function.
   *
   * @default Infinity (no timeout)
   *
   * @example
   * ```typescript
   * fetchProcessingTimeout: 30000 // Abort after 30 seconds
   * ```
   */
  fetchProcessingTimeout?: number;
};

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
};

/**
 * Type representing possible worker states.
 */
type WorkerState = typeof WORKER_STATES[keyof typeof WORKER_STATES];

/**
 * A Worker is a recurring task executor that runs a fetch function at specified intervals.
 * It provides graceful start/stop mechanisms and handles errors through callbacks.
 *
 * The worker ensures that fetch operations are properly cancelled when stopping and
 * respects timeout constraints for long-running operations.
 *
 * @example
 * Basic usage:
 * ```typescript
 * const worker = new Worker({
 *   name: 'job-processor',
 *   interval: 5000,
 *   fetch: async ({ signal }) => {
 *     const jobs = await fetchJobs({ signal });
 *     await processJobs(jobs);
 *   }
 * });
 *
 * // Start the worker
 * worker.start();
 *
 * // Later, stop the worker gracefully
 * worker.stop();
 * ```
 *
 * @example
 * With error handling and timeout:
 * ```typescript
 * const worker = new Worker({
 *   name: 'api-poller',
 *   interval: 10000,
 *   fetchProcessingTimeout: 8000,
 *   fetch: async ({ signal }) => {
 *     const data = await pollAPI({ signal });
 *     await saveData(data);
 *   },
 *   errorCallback: (err) => {
 *     logger.error('Worker error:', err);
 *     metrics.increment('worker.errors');
 *   }
 * });
 *
 * await worker.start();
 * ```
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
   * @default Number.POSITIVE_INFINITY (no timeout)
   */
  readonly #fetchProcessingTimeout = Number.POSITIVE_INFINITY;

  /**
   * Interval in milliseconds between fetch calls.
   * This value is enforced to be at least 1000ms to prevent excessive polling.
   *
   * @private
   * @minimum 1000
   * @default 1000
   */
  readonly #interval: number = 1_000;

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

        this.#interval = Math.max(1_000, options.interval);
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
   * Starts the worker and begins executing the fetch function at the specified interval.
   *
   * This method runs continuously until stop() is called. Each iteration:
   * 1. Executes the fetch function with an AbortSignal
   * 2. Applies the fetchProcessingTimeout if configured
   * 3. Catches and handles any errors via errorCallback
   * 4. Waits for the remaining interval time before the next iteration
   *
   * The worker transitions to 'active' state immediately upon starting.
   * When stop() is called, it transitions to 'stopping' then 'stopped'.
   *
   * @returns {Promise<void>} A promise that resolves when the worker has completely stopped.
   *                          This promise will not resolve until stop() is called.
   *
   * @example
   * Basic usage:
   * ```typescript
   * const worker = new Worker(options);
   *
   * // Start the worker (runs indefinitely)
   * const stopPromise = worker.start();
   *
   * // Later, stop the worker
   * worker.stop();
   *
   * // Wait for graceful shutdown
   * await stopPromise;
   * ```
   *
   * @example
   * With error handling:
   * ```typescript
   * const worker = new Worker({
   *   name: 'processor',
   *   interval: 5000,
   *   fetch: async ({ signal }) => {
   *     // This error will be caught and passed to errorCallback
   *     throw new Error('Processing failed');
   *   },
   *   errorCallback: (err) => console.error('Error:', err)
   * });
   *
   * await worker.start();
   * ```
   */
  async start(): Promise<void> {
    this.state = WORKER_STATES.active;

    while (this.#stopping === false) {
      const cancelTimeout = new AbortController();
      this.#cancelTask = new AbortController();

      const start = performance.now();

      const timeout = async (timeoutInMs: number) => {
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
      } catch (err) {
        if (Error.isError(err)) {
          err.message = `${err.message} (WorkName: ${this.options.name}, Worker: ${this.id})`;
        }
        this.#errorCallback(err);
      } finally {
        cancelTimeout.abort();
      }

      const elapsed = performance.now() - start;

      if (!this.#stopping && this.#interval - elapsed > 100) {
        await setTimeout(this.#interval - elapsed, undefined, {
          signal: this.#cancelTask.signal,
          ref: false
        });
      }
    }

    this.state = WORKER_STATES.stopped;
  }

  /**
   * Stops the worker gracefully.
   *
   * This method signals the worker to stop by setting the internal stopping flag
   * and aborting the current fetch operation and interval timer. The worker will:
   * 1. Transition to 'stopping' state immediately
   * 2. Abort any ongoing fetch operation via AbortSignal
   * 3. Cancel the interval timer between fetches
   * 4. Transition to 'stopped' state once the current iteration completes
   *
   * The method returns immediately, but the worker may take time to fully stop
   * if a fetch operation is in progress. Wait for the start() promise to resolve
   * to ensure the worker has completely stopped.
   *
   * @example
   * Graceful shutdown:
   * ```typescript
   * const worker = new Worker(options);
   * const startPromise = worker.start();
   *
   * // Later, initiate shutdown
   * worker.stop();
   *
   * // Wait for complete shutdown
   * await startPromise;
   * console.log(worker.state); // 'stopped'
   * ```
   *
   * @example
   * With timeout:
   * ```typescript
   * const worker = new Worker({
   *   name: 'task-worker',
   *   interval: 1000,
   *   fetchProcessingTimeout: 5000, // Fetch will be aborted after 5s
   *   fetch: async ({ signal }) => {
   *     await longRunningTask({ signal });
   *   }
   * });
   *
   * const startPromise = worker.start();
   *
   * // Stop the worker - long-running fetch will be aborted
   * worker.stop();
   * await startPromise;
   * ```
   */
  stop(): void {
    this.#stopping = true;
    this.state = WORKER_STATES.stopping;

    this.#cancelTask?.abort();
  }
}
