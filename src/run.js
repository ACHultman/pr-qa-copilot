/* eslint-disable no-console */

const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');
const { chromium } = require('playwright');
const pixelmatch = require('pixelmatch');
const { PNG } = require('pngjs');

const {
  parsePaths,
  parseViewport,
  parseBoolean,
  inferPathsFromFiles,
  mergePaths,
  safeFileStem,
  renderVisualMarkdown,
} = require('./lib');

const COMMENT_MARKER = '<!-- pr-qa-copilot -->';
let core;
let github;

async function loadActionsToolkit() {
  [core, github] = await Promise.all([import('@actions/core'), import('@actions/github')]);
}

function mustGetInput(name) {
  const v = core.getInput(name, { required: true });
  if (!v) throw new Error(`Missing required input: ${name}`);
  return v;
}

function getInput(name, fallback) {
  const v = core.getInput(name);
  return v ? v : fallback;
}

async function ensureDir(dir) {
  await fsp.mkdir(dir, { recursive: true });
}

async function readPng(filePath) {
  const buf = await fsp.readFile(filePath);
  return PNG.sync.read(buf);
}

async function writePng(filePath, png) {
  const buf = PNG.sync.write(png);
  await fsp.writeFile(filePath, buf);
}

function buildRunUrl(owner, repo) {
  const runId = process.env.GITHUB_RUN_ID;
  if (!runId) return null;
  return `https://github.com/${owner}/${repo}/actions/runs/${runId}`;
}

function matchesPattern(value, patterns) {
  return patterns.some((pattern) => {
    try {
      return new RegExp(pattern, 'i').test(value);
    } catch {
      return value.toLowerCase().includes(pattern.toLowerCase());
    }
  });
}

function sameOrigin(candidate, baseUrl) {
  try {
    return new URL(candidate).origin === new URL(baseUrl).origin;
  } catch {
    return false;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function validateLicense({ licenseKey, licenseServerUrl }) {
  if (!licenseKey) return { valid: false, reason: 'missing' };

  const base = (licenseServerUrl || '').replace(/\/$/, '');
  if (!base) return { valid: false, reason: 'no_server_url' };

  try {
    const url = `${base}/api/validate?key=${encodeURIComponent(licenseKey)}`;
    const res = await fetch(url, { method: 'GET' });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data && data.valid) {
      return { valid: true, plan: data.plan || 'pro' };
    }
    return { valid: false, reason: data?.error || 'invalid' };
  } catch {
    return { valid: false, reason: 'validate_failed' };
  }
}

async function summarizePR({ octokit, owner, repo, prNumber, openaiApiKey, openaiModel, maxDiffChars }) {
  const pr = await octokit.rest.pulls.get({ owner, repo, pull_number: prNumber });

  const files = await octokit.paginate(octokit.rest.pulls.listFiles, {
    owner,
    repo,
    pull_number: prNumber,
    per_page: 100,
  });

  const fileList = files.map((f) => ({
    filename: f.filename,
    status: f.status,
    additions: f.additions,
    deletions: f.deletions,
  }));

  const deterministic = {
    title: pr.data.title,
    author: pr.data.user?.login || 'unknown',
    additions: pr.data.additions,
    deletions: pr.data.deletions,
    changedFiles: pr.data.changed_files,
    files: fileList,
  };

  if (!openaiApiKey) {
    return { mode: 'deterministic', deterministic };
  }

  // Fetch diff text (truncate) for LLM.
  const diffRes = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
    owner,
    repo,
    pull_number: prNumber,
    headers: { accept: 'application/vnd.github.v3.diff' },
  });

  const diffText = String(diffRes.data || '').slice(0, maxDiffChars);

  const OpenAI = require('openai');
  const client = new OpenAI({ apiKey: openaiApiKey });

  const prompt = `You are a senior engineer reviewing a PR. Output markdown.

Goals:
- Summarize what changed (2-6 bullets)
- Call out risks/regressions (up to 6 bullets)
- Suggest quick QA steps (3-7 bullets)

PR metadata:
${JSON.stringify(
    {
      title: deterministic.title,
      author: deterministic.author,
      changedFiles: deterministic.changedFiles,
      additions: deterministic.additions,
      deletions: deterministic.deletions,
      files: deterministic.files.slice(0, 50),
    },
    null,
    2,
  )}

Diff (truncated):
${diffText}
`;

  const resp = await client.chat.completions.create({
    model: openaiModel,
    temperature: 0.2,
    messages: [
      { role: 'system', content: 'Be concise, specific, and pragmatic.' },
      { role: 'user', content: prompt },
    ],
  });

  const llmMarkdown = resp.choices?.[0]?.message?.content || '';

  return { mode: 'openai', deterministic, llmMarkdown };
}

async function runVisualQA({
  baseUrl,
  paths,
  viewport,
  workspace,
  enableDiffs,
  waitAfterLoadMs,
  ignoreConsolePatterns,
}) {
  const outDir = path.join(workspace, 'pr-qa-artifacts');
  const screenshotsDir = path.join(outDir, 'screenshots');
  const diffsDir = path.join(outDir, 'diffs');
  const baselineDir = path.join(workspace, '.pr-qa-baseline');

  await ensureDir(screenshotsDir);
  await ensureDir(diffsDir);

  const results = [];

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport });

  try {
    for (const p of paths) {
      const url = baseUrl.replace(/\/$/, '') + p;
      const stem = safeFileStem(p);
      const shotPath = path.join(screenshotsDir, `${stem}.png`);
      const baselinePath = path.join(baselineDir, `${stem}.png`);
      const diffPath = path.join(diffsDir, `${stem}.png`);

      const issues = [];
      const onConsole = (message) => {
        if (message.type() !== 'error') return;
        const text = message.text();
        // Chromium mirrors HTTP failures to the console; the response handler below
        // records the useful status and URL without adding a duplicate issue.
        if (text.startsWith('Failed to load resource: the server responded with a status of')) {
          return;
        }
        if (!matchesPattern(text, ignoreConsolePatterns)) {
          issues.push({ type: 'console', severity: 'error', message: text.slice(0, 500) });
        }
      };
      const onPageError = (error) => {
        issues.push({
          type: 'page',
          severity: 'error',
          message: (error?.message || String(error)).slice(0, 500),
        });
      };
      const onResponse = (response) => {
        const request = response.request();
        const resourceType = request.resourceType();
        if (
          response.status() >= 400 &&
          ['document', 'fetch', 'xhr'].includes(resourceType) &&
          sameOrigin(response.url(), baseUrl)
        ) {
          issues.push({
            type: 'http',
            severity: 'error',
            message: `${response.status()} ${response.url()}`.slice(0, 500),
          });
        }
      };
      const onRequestFailed = (request) => {
        if (
          ['document', 'fetch', 'xhr'].includes(request.resourceType()) &&
          sameOrigin(request.url(), baseUrl)
        ) {
          issues.push({
            type: 'network',
            severity: 'error',
            message: `${request.failure()?.errorText || 'request failed'} ${request.url()}`.slice(
              0,
              500,
            ),
          });
        }
      };

      page.on('console', onConsole);
      page.on('pageerror', onPageError);
      page.on('response', onResponse);
      page.on('requestfailed', onRequestFailed);

      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
        await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => {});
        await page.waitForTimeout(waitAfterLoadMs);
        await page.screenshot({ path: shotPath, fullPage: true });

        let mismatch = null;
        if (enableDiffs && fs.existsSync(baselinePath)) {
          const a = await readPng(baselinePath);
          const b = await readPng(shotPath);

          const width = Math.min(a.width, b.width);
          const height = Math.min(a.height, b.height);

          // Resize by cropping to common size (MVP). A v1.0 should normalize viewport+layout.
          const aCrop = new PNG({ width, height });
          const bCrop = new PNG({ width, height });
          PNG.bitblt(a, aCrop, 0, 0, width, height, 0, 0);
          PNG.bitblt(b, bCrop, 0, 0, width, height, 0, 0);

          const diff = new PNG({ width, height });
          const diffPixels = pixelmatch(aCrop.data, bCrop.data, diff.data, width, height, {
            threshold: 0.12,
          });

          mismatch = diffPixels / (width * height);
          await writePng(diffPath, diff);
        }

        const status = issues.length
          ? 'RUNTIME_ISSUES'
          : typeof mismatch === 'number' && mismatch > 0
            ? 'VISUAL_DIFF'
            : 'PASSED';
        results.push({ path: p, url, status, mismatch, issues, screenshot: true });
      } catch (e) {
        results.push({
          path: p,
          url,
          status: 'ERROR',
          mismatch: null,
          issues,
          screenshot: false,
          error: e instanceof Error ? e.message : String(e),
        });
      } finally {
        page.off('console', onConsole);
        page.off('pageerror', onPageError);
        page.off('response', onResponse);
        page.off('requestfailed', onRequestFailed);
      }
    }
  } finally {
    await page.close().catch(() => {});
    await browser.close().catch(() => {});
  }

  // Minimal HTML gallery
  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>PR QA Copilot — Visual QA</title>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;padding:20px;max-width:1100px;margin:0 auto}
    .row{border:1px solid #eee;border-radius:12px;padding:12px;margin:12px 0}
    .meta{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
    .tag{font-size:12px;padding:2px 8px;border-radius:999px;background:#f3f4f6}
    img{max-width:100%;border:1px solid #eee;border-radius:10px;margin-top:10px}
  </style>
</head>
<body>
  <h1>PR QA Copilot — Visual QA</h1>
  <p>Base URL: <code>${escapeHtml(baseUrl)}</code></p>
  ${results
    .map((r) => {
      const stem = safeFileStem(r.path);
      const shotRel = `screenshots/${stem}.png`;
      const diffRel = `diffs/${stem}.png`;
      const mismatch = typeof r.mismatch === 'number' ? `${(r.mismatch * 100).toFixed(2)}%` : '';
      const issueList = (r.issues || [])
        .map((issue) => `<li><strong>${escapeHtml(issue.type)}</strong>: ${escapeHtml(issue.message)}</li>`)
        .join('');
      return `
  <div class="row">
    <div class="meta">
      <div><strong>${escapeHtml(r.path)}</strong> - <a href="${escapeHtml(r.url)}">${escapeHtml(r.url)}</a></div>
      <span class="tag">${escapeHtml(r.status)}${mismatch ? ` · ${mismatch}` : ''}</span>
    </div>
    ${r.error ? `<p><strong>Navigation error:</strong> ${escapeHtml(r.error)}</p>` : ''}
    ${issueList ? `<ul>${issueList}</ul>` : '<p>No runtime issues detected.</p>'}
    <div>
      ${r.screenshot ? `<img src="${shotRel}" alt="${escapeHtml(r.path)} screenshot" />` : ''}
      ${r.status === 'VISUAL_DIFF' ? `<img src="${diffRel}" alt="${escapeHtml(r.path)} diff" />` : ''}
    </div>
  </div>`;
    })
    .join('\n')}
</body>
</html>`;

  await fsp.writeFile(path.join(outDir, 'index.html'), html, 'utf8');
  await fsp.writeFile(path.join(outDir, 'summary.json'), JSON.stringify({ baseUrl, viewport, results }, null, 2));

  return { outDir, results };
}

async function upsertComment({ octokit, owner, repo, prNumber, body }) {
  const fullBody = `${COMMENT_MARKER}\n${body}`;

  const comments = await octokit.paginate(octokit.rest.issues.listComments, {
    owner,
    repo,
    issue_number: prNumber,
    per_page: 100,
  });

  const existing = comments.find((c) => (c.body || '').includes(COMMENT_MARKER) && c.user && c.user.type === 'Bot');

  if (existing) {
    await octokit.rest.issues.updateComment({
      owner,
      repo,
      comment_id: existing.id,
      body: fullBody,
    });
    return { mode: 'updated', commentId: existing.id };
  }

  const created = await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: prNumber,
    body: fullBody,
  });

  return { mode: 'created', commentId: created.data.id };
}

async function main() {
  await loadActionsToolkit();
  const token = mustGetInput('github_token');
  const baseUrl = mustGetInput('base_url');
  const paths = parsePaths(getInput('paths', '/'));
  const autoPaths = parseBoolean(getInput('auto_paths', 'true'), true);
  const viewport = parseViewport(getInput('viewport', '1280x720'));
  const artifactName = getInput('artifact_name', 'pr-qa-copilot');
  const requestedWait = Number(getInput('wait_after_load_ms', '750'));
  const waitAfterLoadMs = Math.max(
    0,
    Math.min(10_000, Number.isFinite(requestedWait) ? requestedWait : 750),
  );
  const ignoreConsolePatterns = String(core.getInput('ignore_console_patterns') || '')
    .split(/\r?\n/)
    .map((pattern) => pattern.trim())
    .filter(Boolean);
  const failOnIssues = parseBoolean(getInput('fail_on_issues', 'false'));

  const openaiApiKey = core.getInput('openai_api_key') || '';
  const openaiModel = getInput('openai_model', 'gpt-4o-mini');
  const maxDiffChars = Number(getInput('max_diff_chars', '12000'));

  const ctx = github.context;
  const pr = ctx.payload.pull_request;
  const owner = ctx.repo.owner;
  const repo = ctx.repo.repo;
  const prNumber = pr?.number || null;

  const octokit = github.getOctokit(token);

  core.info(
    prNumber
      ? `PR QA Copilot running for ${owner}/${repo}#${prNumber}`
      : `PR QA Copilot running manually for ${owner}/${repo}`,
  );

  const licenseKey = core.getInput('license_key') || '';
  const licenseServerUrl =
    core.getInput('license_server_url') || 'https://pr-qa-copilot.vercel.app';
  const license = await validateLicense({ licenseKey, licenseServerUrl });
  const enableDiffs = Boolean(license.valid);

  const summary = prNumber
    ? await summarizePR({
      octokit,
      owner,
      repo,
      prNumber,
      openaiApiKey: openaiApiKey || null,
      openaiModel,
      maxDiffChars,
    })
    : {
        mode: 'deterministic',
        deterministic: {
          title: 'Manual QA run',
          author: ctx.actor || 'workflow_dispatch',
          additions: 0,
          deletions: 0,
          changedFiles: 0,
          files: [],
        },
      };

  const inferredPaths = autoPaths ? inferPathsFromFiles(summary.deterministic.files) : [];
  const selectedPaths = mergePaths(paths, inferredPaths);
  const visual = await runVisualQA({
    baseUrl,
    paths: selectedPaths,
    viewport,
    workspace: process.env.GITHUB_WORKSPACE || process.cwd(),
    enableDiffs,
    waitAfterLoadMs,
    ignoreConsolePatterns,
  });

  const runUrl = buildRunUrl(owner, repo);

  // Artifacts are written to visual.outDir (default: <workspace>/pr-qa-artifacts).
  // Upload is handled by the composite action using actions/upload-artifact.
  core.setOutput('artifact_dir', visual.outDir);

  const issueCount = visual.results.reduce(
    (total, result) => total + (result.issues?.length || 0) + (result.status === 'ERROR' ? 1 : 0),
    0,
  );
  const qaPassed = issueCount === 0;
  core.setOutput('qa_passed', String(qaPassed));
  core.setOutput('issue_count', String(issueCount));
  core.setOutput('paths_tested', String(selectedPaths.length));

  const visualMd = renderVisualMarkdown(visual.results);

  const licenseNotice = enableDiffs
    ? ''
    : `

---

> Visual diffs are disabled. Runtime QA and screenshots still ran; add a valid \`license_key\` to compare against committed baselines.`;

  const deterministic = summary.deterministic;
  const deterministicMd = `### PR Summary (deterministic)\n\n- **Title:** ${deterministic.title}\n- **Author:** @${deterministic.author}\n- **Files:** ${deterministic.changedFiles}\n- **Add/Delete:** +${deterministic.additions} / -${deterministic.deletions}\n\nTop files:\n${deterministic.files
    .slice(0, 12)
    .map((f) => `- \`${f.filename}\` (${f.status}) +${f.additions}/-${f.deletions}`)
    .join('\n')}`;

  const llmMd =
    summary.mode === 'openai' && summary.llmMarkdown
      ? `\n\n### PR Summary (OpenAI)\n\n${summary.llmMarkdown}`
      : '';

  const verdict = qaPassed ? 'No runtime issues detected' : `${issueCount} runtime issue${issueCount === 1 ? '' : 's'} detected`;
  const inferredNotice = inferredPaths.length
    ? `\n\nChanged routes added automatically: ${inferredPaths.map((route) => `\`${route}\``).join(', ')}`
    : '';
  const commentBody = `## PR QA Copilot\n\n**${verdict}.**\n\n${deterministicMd}${llmMd}\n\n### Runtime and visual QA\n\nBase URL: \`${baseUrl}\`${inferredNotice}\n\n${visualMd}\n\n**Artifact:** \`${artifactName}\` (screenshots, issue details, and gallery)\n${runUrl ? `\nRun: ${runUrl}\n` : ''}\n\n> Runtime QA checks same-origin document and API failures, uncaught page errors, and console errors.${licenseNotice}`;

  if (prNumber) {
    await upsertComment({ octokit, owner, repo, prNumber, body: commentBody });
  } else {
    await core.summary.addRaw(commentBody).write();
  }

  core.info(`Generated visual QA artifacts at ${visual.outDir}`);
  if (!qaPassed && failOnIssues) {
    core.setFailed(`PR QA Copilot detected ${issueCount} runtime issue${issueCount === 1 ? '' : 's'}.`);
  }
}

module.exports = { main, COMMENT_MARKER };

if (require.main === module) {
  main().catch((e) => {
    const message = e instanceof Error ? e.message : String(e);
    if (core) core.setFailed(message);
    else {
      console.error(message);
      process.exitCode = 1;
    }
  });
}
