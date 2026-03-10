const test = require('node:test');
const assert = require('node:assert/strict');

const { parsePaths, parseViewport, safeFileStem, renderVisualMarkdown } = require('../src/lib');

test('parsePaths trims, filters blank, and ensures leading slash', () => {
  assert.deepEqual(parsePaths('  /\npricing\n\n /docs  '), ['/', '/pricing', '/docs']);
});

test('parseViewport parses WIDTHxHEIGHT and falls back to 1280x720', () => {
  assert.deepEqual(parseViewport('800x600'), { width: 800, height: 600 });
  assert.deepEqual(parseViewport('nope'), { width: 1280, height: 720 });
});

test('safeFileStem makes stable filenames', () => {
  assert.equal(safeFileStem('/'), 'home');
  assert.equal(safeFileStem('/pricing/'), 'pricing');
  assert.equal(safeFileStem('/weird path/ok'), 'weird_path_ok');
});

test('renderVisualMarkdown renders a markdown table', () => {
  const md = renderVisualMarkdown([
    { path: '/', status: 'OK', mismatch: 0 },
    { path: '/pricing', status: 'DIFF', mismatch: 0.03123 },
  ]);

  assert.match(md, /\| Path \| Status \| Mismatch \|/);
  assert.match(md, /\| `\/pricing` \| \*\*DIFF\*\* \| 3\.12% \|/);
});
