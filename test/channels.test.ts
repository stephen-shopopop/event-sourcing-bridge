import { describe, it, type TestContext } from 'node:test';
import diagnostics_channel from 'node:diagnostics_channel';
import { channels } from '../src/index.js';

describe('channels', () => {
  it('should export a frozen object', (t: TestContext) => {
    t.plan(1);

    // Assert
    t.assert.ok(Object.isFrozen(channels));
  });

  it('should contain a worker channel', (t: TestContext) => {
    t.plan(2);

    // Assert
    t.assert.ok(channels.worker);
    t.assert.ok(channels.worker instanceof diagnostics_channel.Channel);
  });

  it('should have worker channel with correct name', (t: TestContext) => {
    t.plan(1);

    // Assert
    t.assert.strictEqual(channels.worker.name, 'handling-worker:execution');
  });
});
