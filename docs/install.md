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
  pull-requests: write
  actions: write # required for artifact upload

jobs:
  pr-qa:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: ACHultman/pr-qa-copilot@v0
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          base_url: ${{ vars.PREVIEW_URL }}
          paths: |
            /
            /pricing
            /docs
          # Static Next.js routes changed in the PR are added automatically.
          auto_paths: true
          # Begin in reporting mode. Turn this on after tuning expected noise.
          fail_on_issues: false
          # Optional: enable Pro-only features (e.g., pixel diffs)
          license_key: ${{ secrets.PR_QA_LICENSE_KEY }}
```

## 2) Provide a preview URL
The action needs a URL it can visit in CI.

Common patterns:
- Vercel preview URL (best)
- Netlify deploy preview
- A stable staging URL

Wire it into `base_url`.

## 3) (Optional) Add baselines for diffs
Commit baseline screenshots:

```
.pr-qa-baseline/<stem>.png
```

When the baseline exists, Pro runs can generate pixel diffs.

## 4) Commit + push
Open a PR and you should see:
- a PR comment from the bot
- a route-level verdict covering runtime and visual checks
- an artifact zip containing screenshots, issue details, `summary.json`, and `index.html`

## 5) Gate merges when ready

After expected console patterns and flaky routes are tuned, set:

```yml
fail_on_issues: true
```

The artifact upload still runs when the check fails, so reviewers keep the evidence needed to diagnose it.
