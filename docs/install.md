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
- an artifact zip containing screenshots + `index.html`
