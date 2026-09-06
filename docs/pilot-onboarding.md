# PR QA Copilot: Pilot Onboarding Guide

## What this is
PR QA Copilot is a GitHub Action that, on every PR:
1) posts a PR summary comment (deterministic, or OpenAI-enhanced), and
2) runs Playwright against a preview URL, reports runtime failures route by route, and uploads screenshots plus an HTML gallery (with optional pixel diffs if you provide baselines).

## What we need from you (pilot customer)
### 1) Repo access
- Add **@ACHultman** to the GitHub org/repo with permissions to:
  - read code
  - create PRs (optional)
  - read Actions logs
  - comment on PRs

### 2) Preview deployment
The action automatically uses a successful GitHub Deployment attached to the pull request's head commit. The workflow token needs `deployments: read`.

If your host does not publish a GitHub Deployment with an environment URL, we can wire a known preview or staging URL into the `base_url` override.

### 3) Core routes
A short list of routes that represent your main user journeys, e.g.:
- `/` (home)
- `/pricing`
- `/login`
- `/dashboard`
- `/settings/billing`

Start with **5–15** routes. Static Next.js routes changed in a pull request are added automatically.

### 4) Pro features (license key)
Pixel diffs (and other Pro-only features) require a license key:
- You&apos;ll set `license_key` in the action inputs (usually wired from a repo secret like `PR_QA_LICENSE_KEY`).
- Without a valid key, the action still captures screenshots + uploads the gallery artifact, but skips diffs.

## 5) Auth requirements (if any)
If your app requires login, we need one of:
- a test user credential stored in GitHub Secrets, or
- a magic-link flow we can automate, or
- a cookie/token injection strategy.

(MVP is unauthenticated. Auth flows are part of pilot tuning.)

## What we do during onboarding
1) Add a workflow file (you review + approve).
2) Set up required secrets/vars.
3) Run the demo on a PR.
4) Tune timeouts, expected console patterns, and the core route list.
5) (Optional) Add baseline screenshots for key routes to enable diffs.
6) Turn on merge blocking once the signal is trusted.

## Support + iteration
- First week: quick iteration on flaky routes/timeouts.
- Ongoing: monthly tuning budget included (see README pricing).

## Contact
- Email: adam@hultman.dev
- Telegram: https://t.me/achultman
