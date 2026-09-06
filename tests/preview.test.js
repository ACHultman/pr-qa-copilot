const test = require('node:test');
const assert = require('node:assert/strict');

const {
  normalizeHttpUrl,
  parsePreviewWaitSeconds,
  findSuccessfulDeployment,
  discoverPreviewUrl,
} = require('../src/preview');

function fakeOctokit({ deployments = [], statuses = {} }) {
  return {
    rest: {
      repos: {
        async listDeployments() {
          return { data: deployments };
        },
        async listDeploymentStatuses({ deployment_id: deploymentId }) {
          return { data: statuses[deploymentId] || [] };
        },
      },
    },
  };
}

test('normalizeHttpUrl accepts browser URLs and rejects other protocols', () => {
  assert.equal(normalizeHttpUrl(' https://preview.example.com/#ready '), 'https://preview.example.com');
  assert.equal(normalizeHttpUrl('http://localhost:3000/app'), 'http://localhost:3000/app');
  assert.equal(normalizeHttpUrl('javascript:alert(1)'), null);
  assert.equal(normalizeHttpUrl('not a URL'), null);
});

test('parsePreviewWaitSeconds clamps action input to zero through 900 seconds', () => {
  assert.equal(parsePreviewWaitSeconds('45'), 45);
  assert.equal(parsePreviewWaitSeconds('-1'), 0);
  assert.equal(parsePreviewWaitSeconds('2000'), 900);
  assert.equal(parsePreviewWaitSeconds('invalid'), 300);
});

test('findSuccessfulDeployment prefers a transient preview over production', async () => {
  const preview = {
    id: 20,
    environment: 'Preview',
    transient_environment: true,
    production_environment: false,
    created_at: '2026-09-05T10:00:00Z',
  };
  const production = {
    id: 30,
    environment: 'Production',
    transient_environment: false,
    production_environment: true,
    created_at: '2026-09-05T11:00:00Z',
  };
  const octokit = fakeOctokit({
    deployments: [production, preview],
    statuses: {
      20: [
        {
          id: 201,
          state: 'success',
          environment_url: 'https://feature-20.example.com/',
          updated_at: '2026-09-05T10:02:00Z',
        },
      ],
      30: [
        {
          id: 301,
          state: 'success',
          environment_url: 'https://www.example.com/',
          updated_at: '2026-09-05T11:02:00Z',
        },
      ],
    },
  });

  const result = await findSuccessfulDeployment({
    octokit,
    owner: 'acme',
    repo: 'web',
    sha: 'abc123',
  });

  assert.equal(result.url, 'https://feature-20.example.com');
  assert.equal(result.deployment.id, 20);
});

test('findSuccessfulDeployment requires the latest status to be successful', async () => {
  const octokit = fakeOctokit({
    deployments: [{ id: 20, transient_environment: true }],
    statuses: {
      20: [
        {
          id: 201,
          state: 'success',
          environment_url: 'https://stale.example.com/',
          updated_at: '2026-09-05T10:00:00Z',
        },
        {
          id: 202,
          state: 'failure',
          environment_url: 'https://stale.example.com/',
          updated_at: '2026-09-05T10:01:00Z',
        },
      ],
    },
  });

  assert.equal(
    await findSuccessfulDeployment({
      octokit,
      owner: 'acme',
      repo: 'web',
      sha: 'abc123',
    }),
    null,
  );
});

test('discoverPreviewUrl polls until a successful deployment is available', async () => {
  let clock = 0;
  let deploymentChecks = 0;
  const octokit = {
    rest: {
      repos: {
        async listDeployments() {
          deploymentChecks += 1;
          return {
            data:
              deploymentChecks > 1
                ? [{ id: 42, transient_environment: true }]
                : [],
          };
        },
        async listDeploymentStatuses() {
          return {
            data: [
              {
                state: 'success',
                environment_url: 'https://ready.example.com/',
              },
            ],
          };
        },
      },
    },
  };

  const result = await discoverPreviewUrl({
    octokit,
    owner: 'acme',
    repo: 'web',
    sha: 'abcdef123456',
    waitSeconds: 10,
    pollIntervalMs: 5_000,
    now: () => clock,
    sleep: async (milliseconds) => {
      clock += milliseconds;
    },
  });

  assert.equal(result.url, 'https://ready.example.com');
  assert.equal(deploymentChecks, 2);
});

test('discoverPreviewUrl gives actionable instructions when no preview exists', async () => {
  await assert.rejects(
    discoverPreviewUrl({
      octokit: fakeOctokit({}),
      owner: 'acme',
      repo: 'web',
      sha: 'abcdef123456',
      waitSeconds: 0,
    }),
    /grant deployments: read.*pass base_url explicitly/,
  );
});
