# Install PR QA Copilot (5 minutes)

## 1) Add the workflow
Create `.github/workflows/pr-qa-copilot.yml`:

```yml
name: PR QA Copilot

on:
  pull_request:
    types: [opened, synchronize, reopened]

permissions:
  contents: read
  deployments: read
  pull-requests: write
  actions: write # required for artifact upload

jobs:
  pr-qa:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7

      - uses: ACHultman/pr-qa-copilot@v0
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          paths: |
            /
            /pricing
            /docs
          # Optional: execute stable multi-step acceptance flows.
          journey_file: .pr-qa-copilot/journeys.json
          # Static Next.js routes changed in the PR are added automatically.
          auto_paths: true
          # Begin in reporting mode. Turn this on after tuning expected noise.
          fail_on_issues: false
          # Optional: enable Pro-only features (e.g., pixel diffs)
          license_key: ${{ secrets.PR_QA_LICENSE_KEY }}
```

## 2) Let the action find the preview

By default, the action waits up to five minutes for a successful GitHub Deployment attached to the pull request's head commit, then uses that deployment's environment URL. Keep `deployments: read` in the workflow permissions.

If your host does not publish GitHub Deployments, pass a known URL instead:

```yml
with:
  github_token: ${{ secrets.GITHUB_TOKEN }}
  base_url: ${{ vars.PREVIEW_URL }}
```

Set `preview_wait_seconds` to change the discovery window from its 300-second default, up to 900 seconds.

For a preview protected by Vercel Authentication, enable [Protection Bypass for Automation](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation) in Vercel and store its value as a GitHub Actions secret:

```yml
with:
  github_token: ${{ secrets.GITHUB_TOKEN }}
  vercel_protection_bypass: ${{ secrets.VERCEL_AUTOMATION_BYPASS_SECRET }}
```

The bypass value is masked and scoped to requests on the preview origin.

## 3) (Optional) Add a critical journey

Create `.pr-qa-copilot/journeys.json`:

```json
{
  "journeys": [
    {
      "name": "Pricing to signup",
      "startPath": "/pricing",
      "steps": [
        { "action": "click", "selector": "a[href='/signup']" },
        { "action": "expectUrl", "value": "/signup" },
        { "action": "expectText", "selector": "main", "value": "Create your account" }
      ]
    }
  ]
}
```

For authenticated flows, use `${ENV_NAME}` values in the JSON and pass dedicated test credentials as environment variables on the action step. Supported actions are `click`, `fill`, `check`, `select`, `press`, `waitFor`, `expectText`, and `expectUrl`.

## 4) (Optional) Add baselines for diffs
Commit baseline screenshots:

```
.pr-qa-baseline/<stem>.png
```

When the baseline exists, Pro runs can generate pixel diffs.

## 5) Commit + push
Open a PR and you should see:
- a PR comment from the bot
- a route-level verdict covering runtime and visual checks
- a journey verdict when `journey_file` is configured
- an artifact zip containing screenshots, issue details, `summary.json`, and `index.html`

## 6) Gate merges when ready

After expected console patterns and flaky routes are tuned, set:

```yml
fail_on_issues: true
```

The artifact upload still runs when the check fails, so reviewers keep the evidence needed to diagnose it.
