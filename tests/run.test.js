const test = require('node:test');
const assert = require('node:assert/strict');

const { runJourneyStep } = require('../src/run');

test('expectText waits for an element containing the expected text', async () => {
  const calls = [];
  const page = {
    locator(selector) {
      calls.push(['locator', selector]);
      return {
        first() {
          return this;
        },
        filter(options) {
          calls.push(['filter', options]);
          return this;
        },
        async waitFor(options) {
          calls.push(['waitFor', options]);
        },
      };
    },
  };

  await runJourneyStep(page, {
    action: 'expectText',
    selector: 'h1',
    value: 'I like software that earns its place',
    timeoutMs: 12_000,
  });

  assert.deepEqual(calls, [
    ['locator', 'h1'],
    ['filter', { hasText: 'I like software that earns its place' }],
    ['waitFor', { state: 'visible', timeout: 12_000 }],
  ]);
});

test('expectText reports a stable failure when the text never appears', async () => {
  const page = {
    locator() {
      return {
        first() {
          return this;
        },
        filter() {
          return this;
        },
        async waitFor() {
          throw new Error('locator timeout');
        },
      };
    },
  };

  await assert.rejects(
    runJourneyStep(page, {
      action: 'expectText',
      selector: 'main',
      value: 'Ready',
    }),
    /Expected text was not found in selector "main"/,
  );
});
