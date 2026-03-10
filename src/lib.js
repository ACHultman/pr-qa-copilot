/**
 * Pure helper functions (importable for unit tests).
 */

function parsePaths(multiline) {
  return String(multiline || '')
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((p) => (p.startsWith('/') ? p : `/${p}`));
}

function parseViewport(spec) {
  const m = String(spec || '').trim().match(/^(\d+)x(\d+)$/i);
  if (!m) return { width: 1280, height: 720 };
  return { width: Number(m[1]), height: Number(m[2]) };
}

function safeFileStem(p) {
  if (p === '/' || p === '') return 'home';
  return String(p)
    .replace(/^\//, '')
    .replace(/\/$/, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .slice(0, 80);
}

function renderVisualMarkdown(results) {
  const header = `| Path | Status | Mismatch |\n|---|---:|---:|`;
  const rows = (results || [])
    .map((r) => {
      const mismatch = typeof r.mismatch === 'number' ? `${(r.mismatch * 100).toFixed(2)}%` : '';
      return `| \`${r.path}\` | **${r.status}** | ${mismatch} |`;
    })
    .join('\n');

  return `${header}\n${rows}`;
}

module.exports = {
  parsePaths,
  parseViewport,
  safeFileStem,
  renderVisualMarkdown,
};
