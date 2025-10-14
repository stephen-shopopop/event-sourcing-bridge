import diagnostics_channel from 'node:diagnostics_channel';

/**
 * An object containing pre-defined diagnostics channels for this package.
 *
 * @property worker  The diagnostics channel for worker execution events, used for subscribing to and publishing worker-related messages.
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
