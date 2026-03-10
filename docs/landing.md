# PR QA Copilot

Automated PR reviews with Playwright.

**What you get on every PR**
- A single PR comment with a deterministic summary (and optional OpenAI-enhanced notes)
- A Playwright screenshot pack + HTML gallery artifact
- Optional **pixel diffs** (Pro) when you commit baselines

## Why this exists
PR review bottlenecks are often visual QA bottlenecks:
- Somebody manually clicks through the app and grabs screenshots
- Subtle layout regressions slip through
- Reviewers waste time on setup instead of reviewing changes
- Screenshots live in Slack/DMs instead of the PR

PR QA Copilot makes the artifact automatic and keeps it attached to the PR.

## How it works
1) Define the key routes you care about (5–15 to start)
2) On every PR, the Action runs Playwright against your preview URL
3) It uploads a zip + HTML gallery and posts a comment linking to it
4) (Pro) If you commit baselines, it generates pixel diffs

## Pricing (pilot)
Pilot pricing scales with team size:
- **$99/repo/mo** — small teams (≤ 10 engineers)
- **$149/repo/mo** — mid-size teams (11–40 engineers)
- **$249/repo/mo** — larger teams (41–100 engineers)

All tiers include onboarding + tuning for flakes/timeouts. Less than a single day of senior engineer time per month.

## Next step
Follow **[`docs/pilot-onboarding.md`](./pilot-onboarding.md)** or jump straight to install:
- **[`docs/install.md`](./install.md)**
