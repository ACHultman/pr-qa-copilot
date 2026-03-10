/* eslint-disable no-console */

const core = require('@actions/core');
const github = require('@actions/github');
const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');
const { chromium } = require('playwright');
const pixelmatch = require('pixelmatch');
const { PNG } = require('pngjs');

const { parsePaths, parseViewport, safeFileStem, renderVisualMarkdown } = require('./lib');

const COMMENT_MARKER = '<!-- pr-qa-copilot -->';

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

async function runVisualQA({ baseUrl, paths, viewport, workspace, enableDiffs }) {
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

      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 45_000 });
        await page.waitForTimeout(750);
        await page.screenshot({ path: shotPath, fullPage: true });

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

          const mismatch = diffPixels / (width * height);
          await writePng(diffPath, diff);

          results.push({ path: p, url, status: diffPixels === 0 ? 'OK' : 'DIFF', mismatch });
        } else {
          results.push({
            path: p,
            url,
            status: enableDiffs ? 'NEW_BASELINE' : 'CAPTURED',
            mismatch: null,
          });
        }
      } catch (e) {
        results.push({
          path: p,
          url,
          status: 'ERROR',
          mismatch: null,
          error: e instanceof Error ? e.message : String(e),
        });
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
  <p>Base URL: <code>${baseUrl}</code></p>
  ${results
    .map((r) => {
      const stem = safeFileStem(r.path);
      const shotRel = `screenshots/${stem}.png`;
      const diffRel = `diffs/${stem}.png`;
      const mismatch = typeof r.mismatch === 'number' ? `${(r.mismatch * 100).toFixed(2)}%` : '';
      return `
  <div class="row">
    <div class="meta">
      <div><strong>${r.path}</strong> — <a href="${r.url}">${r.url}</a></div>
      <span class="tag">${r.status}${mismatch ? ` · ${mismatch}` : ''}</span>
    </div>
    <div>
      <img src="${shotRel}" alt="${r.path} screenshot" />
      ${r.status === 'DIFF' ? `<img src="${diffRel}" alt="${r.path} diff" />` : ''}
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
  const token = mustGetInput('github_token');
  const baseUrl = mustGetInput('base_url');
  const paths = parsePaths(getInput('paths', '/'));
  const viewport = parseViewport(getInput('viewport', '1280x720'));
  const artifactName = getInput('artifact_name', 'pr-qa-copilot');

  const openaiApiKey = core.getInput('openai_api_key') || '';
  const openaiModel = getInput('openai_model', 'gpt-4o-mini');
  const maxDiffChars = Number(getInput('max_diff_chars', '12000'));

  const ctx = github.context;
  const pr = ctx.payload.pull_request;
  if (!pr) {
    core.setFailed('This action must run on pull_request events.');
    return;
  }

  const owner = ctx.repo.owner;
  const repo = ctx.repo.repo;
  const prNumber = pr.number;

  const octokit = github.getOctokit(token);

  core.info(`PR QA Copilot running for ${owner}/${repo}#${prNumber}`);

  const licenseKey = core.getInput('license_key') || '';
  const licenseServerUrl = core.getInput('license_server_url') || 'https://prqacopilot.com';
  const license = await validateLicense({ licenseKey, licenseServerUrl });
  const enableDiffs = Boolean(license.valid);

  const [summary, visual] = await Promise.all([
    summarizePR({
      octokit,
      owner,
      repo,
      prNumber,
      openaiApiKey: openaiApiKey || null,
      openaiModel,
      maxDiffChars,
    }),
    runVisualQA({
      baseUrl,
      paths,
      viewport,
      workspace: process.env.GITHUB_WORKSPACE || process.cwd(),
      enableDiffs,
    }),
  ]);

  const runUrl = buildRunUrl(owner, repo);

  // Artifacts are written to visual.outDir (default: <workspace>/pr-qa-artifacts).
  // Upload is handled by the composite action using actions/upload-artifact.
  core.setOutput('artifact_dir', visual.outDir);

  const visualMd = renderVisualMarkdown(visual.results);

  const licenseNotice = enableDiffs
    ? ''
    : `

---

> ⚠️ Visual diffs are disabled (no valid license key). Add \`license_key\` to the Action inputs to enable Pro features.`;

  const deterministic = summary.deterministic;
  const deterministicMd = `### PR Summary (deterministic)\n\n- **Title:** ${deterministic.title}\n- **Author:** @${deterministic.author}\n- **Files:** ${deterministic.changedFiles}\n- **Add/Delete:** +${deterministic.additions} / -${deterministic.deletions}\n\nTop files:\n${deterministic.files
    .slice(0, 12)
    .map((f) => `- \`${f.filename}\` (${f.status}) +${f.additions}/-${f.deletions}`)
    .join('\n')}`;

  const llmMd =
    summary.mode === 'openai' && summary.llmMarkdown
      ? `\n\n### PR Summary (OpenAI)\n\n${summary.llmMarkdown}`
      : '';

  const commentBody = `## PR QA Copilot\n\n${deterministicMd}${llmMd}\n\n### Visual QA\n\nBase URL: \`${baseUrl}\`\n\n${visualMd}\n\n**Artifact:** \`${artifactName}\` (screenshots + gallery)\n${runUrl ? `\nRun: ${runUrl}\n` : ''}\n\n> Tip: Commit baseline screenshots to \`.pr-qa-baseline/*.png\` to enable pixel diffs.${licenseNotice}`;

  await upsertComment({ octokit, owner, repo, prNumber, body: commentBody });

  core.info(`Generated visual QA artifacts at ${visual.outDir}`);
}

module.exports = { main, COMMENT_MARKER };

if (require.main === module) {
  main().catch((e) => {
    core.setFailed(e instanceof Error ? e.message : String(e));
  });
}
