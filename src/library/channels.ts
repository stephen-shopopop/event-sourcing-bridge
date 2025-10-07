import diagnostics_channel from 'node:diagnostics_channel';

/**
 * An object containing pre-defined diagnostics channels for the web server.
 *
 * @property error   The diagnostics channel for error events, used for subscribing to and publishing error-related messages.
 * @property info    The diagnostics channel for informational events, used for subscribing to and publishing info messages.
 *
 * These channels are intended to be used with Node.js's `diagnostics_channel` module for structured event handling.
 */
export const channels = Object.freeze({
  /**
   * ```ts
   * import diagnostics_channel from ‘node:diagnostics_channel’
   *
   * diagnostics_channel.subscribe(‘handling-worker:error’, (message, name) => {
   *  console.log(message, name)
   * })
   * ```
   */
  worker: diagnostics_channel.channel('handling-worker:execution')
});
