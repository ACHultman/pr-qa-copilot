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

function parseBoolean(value, fallback = false) {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (!normalized) return fallback;
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  return fallback;
}

function inferPathsFromFiles(files) {
  const paths = [];
  const routePatterns = [
    /^(?:src\/)?app\/(.+?)\/page\.(?:js|jsx|ts|tsx)$/,
    /^(?:src\/)?app\/page\.(?:js|jsx|ts|tsx)$/,
    /^(?:src\/)?pages\/(.+?)\.(?:js|jsx|ts|tsx)$/,
  ];

  for (const file of files || []) {
    const filename = typeof file === 'string' ? file : file?.filename;
    if (!filename || /(?:^|\/)api\//.test(filename)) continue;

    let route = null;
    const appMatch = filename.match(routePatterns[0]);
    if (appMatch) {
      route = appMatch[1]
        .split('/')
        .filter((segment) => !/^\(.+\)$/.test(segment) && !segment.startsWith('@'))
        .join('/');
    } else if (routePatterns[1].test(filename)) {
      route = '';
    } else {
      const pagesMatch = filename.match(routePatterns[2]);
      if (pagesMatch && !/^_(?:app|document|error)$/.test(pagesMatch[1])) {
        route = pagesMatch[1].replace(/(?:^|\/)index$/, '');
      }
    }

    if (route === null || route.split('/').some((segment) => segment.includes('['))) continue;
    const normalized = `/${route}`.replace(/\/{2,}/g, '/').replace(/\/$/, '') || '/';
    if (!paths.includes(normalized)) paths.push(normalized);
  }

  return paths;
}

function mergePaths(configured, inferred) {
  return [...new Set([...(configured || []), ...(inferred || [])])];
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
  const header = `| Path | Result | Runtime issues | Visual change |\n|---|---:|---:|---:|`;
  const rows = (results || [])
    .map((r) => {
      const mismatch = typeof r.mismatch === 'number' ? `${(r.mismatch * 100).toFixed(2)}%` : '';
      const issues = Array.isArray(r.issues) ? r.issues.length : 0;
      return `| \`${r.path}\` | **${r.status}** | ${issues || 'None'} | ${mismatch || 'None'} |`;
    })
    .join('\n');

  return `${header}\n${rows}`;
}

module.exports = {
  parsePaths,
  parseViewport,
  parseBoolean,
  inferPathsFromFiles,
  mergePaths,
  safeFileStem,
  renderVisualMarkdown,
};
