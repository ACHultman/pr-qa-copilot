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

function normalizeVisibleText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
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

const JOURNEY_ACTIONS = new Set([
  'check',
  'click',
  'expectText',
  'expectUrl',
  'fill',
  'press',
  'select',
  'waitFor',
]);

const ACTIONS_REQUIRING_SELECTOR = new Set([
  'check',
  'click',
  'expectText',
  'fill',
  'press',
  'select',
  'waitFor',
]);

const ACTIONS_REQUIRING_VALUE = new Set([
  'expectText',
  'expectUrl',
  'fill',
  'press',
  'select',
]);

function boundedString(value, label, maxLength) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${label} must be a non-empty string.`);
  }
  const normalized = value.trim();
  if (normalized.length > maxLength) {
    throw new Error(`${label} must be ${maxLength} characters or fewer.`);
  }
  return normalized;
}

function parseJourneyConfig(raw) {
  let parsed;
  try {
    parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (error) {
    throw new Error(`Journey file is not valid JSON: ${error.message}`);
  }

  const source = Array.isArray(parsed) ? parsed : parsed?.journeys;
  if (!Array.isArray(source)) {
    throw new Error('Journey file must contain a "journeys" array.');
  }
  if (source.length > 10) {
    throw new Error('Journey file may contain at most 10 journeys.');
  }

  const seenNames = new Set();
  return source.map((journey, journeyIndex) => {
    if (!journey || typeof journey !== 'object' || Array.isArray(journey)) {
      throw new Error(`Journey ${journeyIndex + 1} must be an object.`);
    }

    const name = boundedString(journey.name, `Journey ${journeyIndex + 1} name`, 100);
    if (seenNames.has(name)) {
      throw new Error(`Journey names must be unique: "${name}" is repeated.`);
    }
    seenNames.add(name);

    const startPath = boundedString(
      journey.startPath,
      `Journey "${name}" startPath`,
      500,
    );
    if (!startPath.startsWith('/') || startPath.startsWith('//') || startPath.includes('\\')) {
      throw new Error(`Journey "${name}" startPath must be a relative path beginning with "/".`);
    }

    if (!Array.isArray(journey.steps) || journey.steps.length === 0) {
      throw new Error(`Journey "${name}" must contain at least one step.`);
    }
    if (journey.steps.length > 30) {
      throw new Error(`Journey "${name}" may contain at most 30 steps.`);
    }

    const steps = journey.steps.map((step, stepIndex) => {
      const prefix = `Journey "${name}" step ${stepIndex + 1}`;
      if (!step || typeof step !== 'object' || Array.isArray(step)) {
        throw new Error(`${prefix} must be an object.`);
      }
      const action = boundedString(step.action, `${prefix} action`, 40);
      if (!JOURNEY_ACTIONS.has(action)) {
        throw new Error(`${prefix} has unsupported action "${action}".`);
      }

      const normalized = { action };
      if (ACTIONS_REQUIRING_SELECTOR.has(action)) {
        normalized.selector = boundedString(step.selector, `${prefix} selector`, 500);
      }
      if (ACTIONS_REQUIRING_VALUE.has(action)) {
        normalized.value = boundedString(step.value, `${prefix} value`, 500);
      }
      if (
        action === 'expectUrl' &&
        (!normalized.value.startsWith('/') ||
          normalized.value.startsWith('//') ||
          normalized.value.includes('\\'))
      ) {
        throw new Error(`${prefix} expectUrl value must be a relative URL beginning with "/".`);
      }

      if (step.timeoutMs !== undefined) {
        const timeoutMs = Number(step.timeoutMs);
        if (!Number.isFinite(timeoutMs) || timeoutMs < 1_000 || timeoutMs > 30_000) {
          throw new Error(`${prefix} timeoutMs must be between 1000 and 30000.`);
        }
        normalized.timeoutMs = Math.round(timeoutMs);
      }

      return normalized;
    });

    return { name, startPath, steps };
  });
}

function resolveJourneyValue(value, environment = process.env) {
  return String(value).replace(/\$\{([A-Z_][A-Z0-9_]*)\}/g, (_match, name) => {
    if (!Object.prototype.hasOwnProperty.call(environment, name)) {
      throw new Error(`Journey value references missing environment variable ${name}.`);
    }
    return String(environment[name] ?? '');
  });
}

function renderJourneyMarkdown(results) {
  if (!results?.length) return '';
  const header = `| Journey | Result | Steps | Runtime issues | Failure |\n|---|---:|---:|---:|---|`;
  const rows = results
    .map((result) => {
      const issues = Array.isArray(result.issues) ? result.issues.length : 0;
      const steps = Number(result.stepsCompleted || 0);
      const name = String(result.name || '').replace(/\r?\n/g, ' ').replaceAll('|', '\\|');
      const failure = result.error
        ? normalizeVisibleText(result.error).replaceAll('|', '\\|').slice(0, 240)
        : '—';
      return `| ${name} | **${result.status}** | ${steps}/${result.stepCount} | ${issues || 'None'} | ${failure} |`;
    })
    .join('\n');
  return `${header}\n${rows}`;
}

module.exports = {
  parsePaths,
  parseViewport,
  parseBoolean,
  normalizeVisibleText,
  inferPathsFromFiles,
  mergePaths,
  safeFileStem,
  renderVisualMarkdown,
  parseJourneyConfig,
  resolveJourneyValue,
  renderJourneyMarkdown,
};
