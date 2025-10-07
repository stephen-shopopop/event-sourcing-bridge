/**
 * Configuration options for creating a Worker instance.
 */
export type WorkerOptions = {
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
   *   if (signal.aborted) {
   *     throw new Error('Fetch operation was aborted');
   *   }
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
