/**
 * Resolve a browser-safe preview URL from GitHub deployment statuses.
 */

function normalizeHttpUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null;

  try {
    const parsed = new URL(value.trim());
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    parsed.hash = '';
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return null;
  }
}

function parsePreviewWaitSeconds(value, fallback = 300) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.min(900, Math.round(parsed)));
}

function compareNewest(a, b) {
  const aTime = Date.parse(a?.updated_at || a?.created_at || '') || 0;
  const bTime = Date.parse(b?.updated_at || b?.created_at || '') || 0;
  if (aTime !== bTime) return bTime - aTime;
  return Number(b?.id || 0) - Number(a?.id || 0);
}

function deploymentRank(deployment) {
  if (deployment?.transient_environment) return 0;
  if (!deployment?.production_environment) return 1;
  return 2;
}

async function findSuccessfulDeployment({ octokit, owner, repo, sha }) {
  const response = await octokit.rest.repos.listDeployments({
    owner,
    repo,
    sha,
    per_page: 100,
  });

  const deployments = [...(response.data || [])]
    .sort((a, b) => deploymentRank(a) - deploymentRank(b) || compareNewest(a, b))
    .slice(0, 20);

  for (const deployment of deployments) {
    const statusesResponse = await octokit.rest.repos.listDeploymentStatuses({
      owner,
      repo,
      deployment_id: deployment.id,
      per_page: 100,
    });
    const latestStatus = [...(statusesResponse.data || [])].sort(compareNewest)[0];

    // Never reuse an older successful status after a deployment has failed,
    // become inactive, or returned to a transient state.
    if (latestStatus?.state !== 'success') continue;

    const url = normalizeHttpUrl(latestStatus.environment_url);
    if (url) return { url, deployment, status: latestStatus };
  }

  return null;
}

async function discoverPreviewUrl({
  octokit,
  owner,
  repo,
  sha,
  waitSeconds = 300,
  pollIntervalMs = 5_000,
  sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
  now = () => Date.now(),
  log = () => {},
}) {
  const boundedWaitSeconds = parsePreviewWaitSeconds(waitSeconds);
  const deadline = now() + boundedWaitSeconds * 1_000;
  let attempts = 0;

  while (true) {
    attempts += 1;
    const match = await findSuccessfulDeployment({ octokit, owner, repo, sha });
    if (match) return match;

    const remainingMs = deadline - now();
    if (remainingMs <= 0) break;

    const delayMs = Math.min(pollIntervalMs, remainingMs);
    log(
      'No successful preview deployment found for ' +
        sha.slice(0, 7) +
        ' yet; checking again in ' +
        Math.ceil(delayMs / 1_000) +
        's.',
    );
    await sleep(delayMs);
  }

  throw new Error(
    'No successful GitHub deployment with an environment URL was found for commit ' +
      sha +
      ' after ' +
      attempts +
      ' check' +
      (attempts === 1 ? '' : 's') +
      '. Ensure the preview provider creates GitHub Deployments, grant deployments: read, increase preview_wait_seconds, or pass base_url explicitly.',
  );
}

module.exports = {
  normalizeHttpUrl,
  parsePreviewWaitSeconds,
  findSuccessfulDeployment,
  discoverPreviewUrl,
};
