import { describe, it, type TestContext } from 'node:test';
import { SECONDS_TO_MS, DEFAULT_INTERVAL } from '../src/library/constants.js';

describe('constants', () => {
  describe('SECONDS_TO_MS', () => {
    it('should equal 1000 milliseconds', (t: TestContext) => {
      t.plan(1);

      // Assert
      t.assert.equal(SECONDS_TO_MS, 1000);
    });

    it('should be a number', (t: TestContext) => {
      t.plan(1);

      // Assert
      t.assert.equal(typeof SECONDS_TO_MS, 'number');
    });

    it('should convert seconds to milliseconds correctly', (t: TestContext) => {
      t.plan(1);

      // Arrange
      const seconds = 5;
      const expectedMs = 5000;

      // Assert
      t.assert.equal(seconds * SECONDS_TO_MS, expectedMs);
    });
  });

  describe('DEFAULT_INTERVAL', () => {
    it('should equal SECONDS_TO_MS', (t: TestContext) => {
      t.plan(1);

      // Assert
      t.assert.equal(DEFAULT_INTERVAL, SECONDS_TO_MS);
    });

    it('should equal 1000 milliseconds', (t: TestContext) => {
      t.plan(1);

      // Assert
      t.assert.equal(DEFAULT_INTERVAL, 1000);
    });

    it('should be a number', (t: TestContext) => {
      t.plan(1);

      // Assert
      t.assert.equal(typeof DEFAULT_INTERVAL, 'number');
    });

    it('should be a positive value', (t: TestContext) => {
      t.plan(1);

      // Assert
      t.assert.ok(DEFAULT_INTERVAL > 0);
    });
  });
});
