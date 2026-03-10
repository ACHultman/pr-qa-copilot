# Pilot Pitch — PR QA Copilot

## Who to target
- 5–50 person dev shops doing web apps (React/Next.js) with frequent PRs
- Teams already using Vercel/Netlify previews
- Agencies with multiple client repos (repeatable template)

Signals they feel the pain:
- PRs merged without clicking the preview
- Bugs regress visually (layout shifts, missing buttons)
- “QA is a bottleneck” / “no QA bandwidth”

## 20-second pitch
“Every PR gets an automated review comment plus a visual QA pack. We hit your preview URL with Playwright, upload screenshots + a gallery artifact, and optionally do pixel diffs against a committed baseline. It catches UI regressions before merge, with almost zero team effort.”

## What to say (email/DM template)
Subject: Automated visual QA on every PR (pilot)

Hey {{name}} — quick idea for your PR flow.

We ship a lightweight GitHub Action that, on every PR:
- posts a concise PR summary (optionally OpenAI-enhanced)
- runs Playwright against your preview URL
- uploads a screenshots + HTML gallery artifact, and can do pixel diffs with baselines

If you’re open to a 2–3 week pilot, I can onboard you in ~30 minutes. All I need is a preview URL pattern and a list of routes to cover.

Want me to set this up on one repo and show the output on your next PR?

— Adam
adam@achultman.com | https://t.me/achultman

## What to ask for (pilot checklist)
- Repo access for @ACHultman
- Preview URL source (Vercel/Netlify) + how to get it in CI
- Route list (5–15 to start)
- Any auth needs (test user / cookie strategy)

## Pricing (pilot)
$200–$500/mo per repo
- includes onboarding
- includes 10 hours/month of tuning + support (flaky routes, auth, timeouts)
- cancel any time

## Objections + answers
- “We already have Playwright tests.”
  - Great — this complements them by producing a human-friendly artifact tied to each PR.
- “It’ll be flaky.”
  - Pilot includes tuning. We start with stable routes and add coverage gradually.
- “We can’t expose preview URLs publicly.”
  - Works with private previews if Actions runner can reach them; we can also use an internal staging URL.
