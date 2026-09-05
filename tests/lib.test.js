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
