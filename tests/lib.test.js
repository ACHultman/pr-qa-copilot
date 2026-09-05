const test = require('node:test');
const assert = require('node:assert/strict');

const {
  parsePaths,
  parseViewport,
  parseBoolean,
  inferPathsFromFiles,
  mergePaths,
  safeFileStem,
  renderVisualMarkdown,
  parseJourneyConfig,
  resolveJourneyValue,
  renderJourneyMarkdown,
} = require('../src/lib');

test('parsePaths trims, filters blank, and ensures leading slash', () => {
  assert.deepEqual(parsePaths('  /\npricing\n\n /docs  '), ['/', '/pricing', '/docs']);
});

test('parseViewport parses WIDTHxHEIGHT and falls back to 1280x720', () => {
  assert.deepEqual(parseViewport('800x600'), { width: 800, height: 600 });
  assert.deepEqual(parseViewport('nope'), { width: 1280, height: 720 });
});

test('parseBoolean accepts common action input values', () => {
  assert.equal(parseBoolean('true'), true);
  assert.equal(parseBoolean('OFF', true), false);
  assert.equal(parseBoolean('', true), true);
});

test('inferPathsFromFiles finds static Next.js routes and skips dynamic/API routes', () => {
  assert.deepEqual(
    inferPathsFromFiles([
      { filename: 'src/app/page.tsx' },
      { filename: 'src/app/(marketing)/pricing/page.tsx' },
      { filename: 'src/app/api/checkout/route.ts' },
      { filename: 'src/app/blog/[slug]/page.tsx' },
      { filename: 'pages/docs/index.tsx' },
      { filename: 'src/pages/account/settings.tsx' },
    ]),
    ['/', '/pricing', '/docs', '/account/settings'],
  );
});

test('mergePaths deduplicates configured and inferred routes', () => {
  assert.deepEqual(mergePaths(['/', '/pricing'], ['/pricing', '/docs']), ['/', '/pricing', '/docs']);
});

test('safeFileStem makes stable filenames', () => {
  assert.equal(safeFileStem('/'), 'home');
  assert.equal(safeFileStem('/pricing/'), 'pricing');
  assert.equal(safeFileStem('/weird path/ok'), 'weird_path_ok');
});

test('renderVisualMarkdown renders a markdown table', () => {
  const md = renderVisualMarkdown([
    { path: '/', status: 'PASSED', mismatch: 0, issues: [] },
    { path: '/pricing', status: 'VISUAL_DIFF', mismatch: 0.03123, issues: [{ type: 'console' }] },
  ]);

  assert.match(md, /\| Path \| Result \| Runtime issues \| Visual change \|/);
  assert.match(md, /\| `\/pricing` \| \*\*VISUAL_DIFF\*\* \| 1 \| 3\.12% \|/);
});

test('parseJourneyConfig validates and normalizes supported steps', () => {
  assert.deepEqual(
    parseJourneyConfig({
      journeys: [
        {
          name: 'Cancel subscription',
          startPath: '/settings/billing',
          steps: [
            { action: 'click', selector: '[data-testid="cancel"]' },
            { action: 'fill', selector: '#reason', value: '${CANCEL_REASON}' },
            { action: 'expectText', selector: 'main', value: 'Subscription canceled' },
            { action: 'expectUrl', value: '/settings/billing?status=canceled' },
          ],
        },
      ],
    }),
    [
      {
        name: 'Cancel subscription',
        startPath: '/settings/billing',
        steps: [
          { action: 'click', selector: '[data-testid="cancel"]' },
          { action: 'fill', selector: '#reason', value: '${CANCEL_REASON}' },
          { action: 'expectText', selector: 'main', value: 'Subscription canceled' },
          { action: 'expectUrl', value: '/settings/billing?status=canceled' },
        ],
      },
    ],
  );
});

test('parseJourneyConfig rejects unsafe paths and unsupported steps', () => {
  assert.throws(
    () =>
      parseJourneyConfig({
        journeys: [{ name: 'External', startPath: 'https://example.com', steps: [{ action: 'click', selector: 'a' }] }],
      }),
    /relative path/,
  );
  assert.throws(
    () =>
      parseJourneyConfig({
        journeys: [{ name: 'Shell', startPath: '/', steps: [{ action: 'run', value: 'echo no' }] }],
      }),
    /unsupported action/,
  );
});

test('resolveJourneyValue expands named environment values and reports missing names', () => {
  assert.equal(
    resolveJourneyValue('${TEST_USER}:${TEST_PASSWORD}', {
      TEST_USER: 'qa@example.com',
      TEST_PASSWORD: 'not-logged',
    }),
    'qa@example.com:not-logged',
  );
  assert.throws(() => resolveJourneyValue('${MISSING}', {}), /missing environment variable MISSING/);
});

test('renderJourneyMarkdown reports completed steps and runtime issues', () => {
  const markdown = renderJourneyMarkdown([
    {
      name: 'Pricing to checkout',
      status: 'PASSED',
      stepsCompleted: 3,
      stepCount: 3,
      issues: [],
    },
    {
      name: 'Cancel subscription',
      status: 'ERROR',
      stepsCompleted: 2,
      stepCount: 4,
      issues: [{ type: 'http' }],
    },
  ]);

  assert.match(markdown, /\| Pricing to checkout \| \*\*PASSED\*\* \| 3\/3 \| None \|/);
  assert.match(markdown, /\| Cancel subscription \| \*\*ERROR\*\* \| 2\/4 \| 1 \|/);
});
