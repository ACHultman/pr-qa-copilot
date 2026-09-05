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
“Every PR gets runtime QA before a human opens the preview. We test the routes that changed, catch page, console, API, and network failures, and leave screenshots plus one verdict on the pull request.”

## What to say (email/DM template)
Subject: Automated visual QA on every PR (pilot)

Hey {{name}} — quick idea for your PR flow.

We ship a lightweight GitHub Action that, on every PR:
- adds the static routes changed by the diff to your core smoke-test paths
- catches uncaught page errors, console errors, and same-origin request failures
- leaves one report with screenshots, issue details, and optional visual diffs

If you’re open to a 2–3 week pilot, I can onboard you in ~30 minutes. All I need is a preview URL pattern and a list of routes to cover.

Want me to set this up on one repo and show the output on your next PR?

— Adam
adam@achultman.com | https://t.me/achultman

## What to ask for (pilot checklist)
- Repo access for @ACHultman
- Preview URL source (Vercel/Netlify) + how to get it in CI
- Route list (5–15 to start)
- Any auth needs (test user / cookie strategy)

## Pricing (paid pilot)
- $399/month for up to 3 repositories
- $999/month for agencies with up to 10 repositories
- includes onboarding, auth/private-preview setup, and route tuning
- cancel any time

## Objections + answers
- “We already have Playwright tests.”
  - Great — this complements them by producing a human-friendly artifact tied to each PR.
- “It’ll be flaky.”
  - Pilot includes tuning. We start with stable routes and add coverage gradually.
- “We can’t expose preview URLs publicly.”
  - Works with private previews if Actions runner can reach them; we can also use an internal staging URL.
