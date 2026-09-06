# PR QA Copilot

Runtime QA for every preview deployment.

**What you get on every PR**
- Automatic preview discovery from the PR's successful GitHub deployment
- A single PR comment with a route-level QA verdict
- Console, page, request, and HTTP failure detection
- Automatic coverage for static Next.js routes changed in the PR
- A Playwright screenshot pack, JSON results, and HTML gallery artifact
- Optional **pixel diffs** (Pro) when you commit baselines

## Why this exists
PR review bottlenecks are often visual QA bottlenecks:
- Somebody manually clicks through the app and grabs screenshots
- Subtle layout regressions slip through
- Reviewers waste time on setup instead of reviewing changes
- Screenshots live in Slack/DMs instead of the PR

PR QA Copilot makes the artifact automatic and keeps it attached to the PR.

## How it works
1) Define the core routes and critical flows you care about
2) On every PR, the Action finds the successful preview and adds changed static routes
3) It records runtime failures, screenshots, and optional pixel diffs
4) It uploads the evidence and posts one concise report

## Pricing (paid pilot)
- **$399/month** for up to 3 repositories
- **$999/month** for agencies with up to 10 repositories

Both include onboarding, private-preview/auth setup, and tuning for noisy routes.

## Next step
Follow **[`docs/pilot-onboarding.md`](./pilot-onboarding.md)** or jump straight to install:
- **[`docs/install.md`](./install.md)**
