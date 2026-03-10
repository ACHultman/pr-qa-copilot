# PR QA Copilot (GitHub Action)

MVP: on every PR, post a quick **PR summary** and generate a **Playwright screenshot pack** (plus optional pixel diffs if you check in baselines).

This is designed to be a demo we can sell to a dev shop quickly: “every PR gets a review comment + a visual QA artifact, automatically.”

## Usage

Create `.github/workflows/pr-qa-copilot.yml`:

```yml
name: PR QA Copilot

on:
  pull_request:
    types: [opened, synchronize, reopened]

permissions:
  contents: read
  pull-requests: write

jobs:
  pr-qa:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # (optional) if your preview URL is available as an env var from another step,
      # pass it into base_url below.

      - uses: ACHultman/pr-qa-copilot@v0
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          base_url: ${{ vars.PREVIEW_URL }}
          paths: |
            /
            /build
            /results
```

### Inputs
- `base_url` (required): where screenshots are taken from.
- `paths`: newline-separated list of paths.
- `openai_api_key` (optional): if set, summary uses OpenAI; otherwise a deterministic file/LOC summary.

## Visual baseline + diffs (optional)
If you commit baseline screenshots at:

```
.pr-qa-baseline/<path>.png
```

the action will generate diff images and include a mismatch % in the PR comment.

## What gets uploaded
A workflow artifact (default name: `pr-qa-copilot`) containing:
- `screenshots/*.png`
- `diffs/*.png` (only if baseline exists)
- `index.html` (quick gallery)
- `summary.json`

## Versioning
This repo is currently MVP. Tag `v0` will be created after first PR is merged.
