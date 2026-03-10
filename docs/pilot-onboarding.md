# PR QA Copilot — Pilot Onboarding Guide (1-pager)

## What this is
PR QA Copilot is a GitHub Action that, on every PR:
1) posts a PR summary comment (deterministic, or OpenAI-enhanced), and
2) runs Playwright against a preview URL, uploading a screenshots + HTML gallery artifact (optional pixel diffs if you provide baselines).

## What we need from you (pilot customer)
### 1) Repo access
- Add **@ACHultman** to the GitHub org/repo with permissions to:
  - read code
  - create PRs (optional)
  - read Actions logs
  - comment on PRs

### 2) Preview URL pattern (Vercel/Netlify/etc)
We need a stable way to obtain the PR preview URL. Typical options:
- **Vercel**: `https://<project>-git-<branch>-<team>.vercel.app`
- **Netlify**: provided as a build output / commit status

If you already have a step that outputs the preview URL, we can wire it into the action input `base_url`.

### 3) A route list
A short list of routes that represent your main user journeys, e.g.:
- `/` (home)
- `/pricing`
- `/login`
- `/dashboard`
- `/settings/billing`

Start with **5–15** routes. More is fine, but can increase run time.

### 4) Auth requirements (if any)
If your app requires login, we need one of:
- a test user credential stored in GitHub Secrets, or
- a magic-link flow we can automate, or
- a cookie/token injection strategy.

(MVP is unauthenticated. Auth flows are part of pilot tuning.)

## What we do during onboarding
1) Add a workflow file (you review + approve).
2) Set up required secrets/vars.
3) Run the demo on a PR.
4) Tune timeouts, waits, and route list.
5) (Optional) Add baseline screenshots for key routes to enable diffs.

## Support + iteration
- First week: quick iteration on flaky routes/timeouts.
- Ongoing: monthly tuning budget included (see README pricing).

## Contact
- Email: adam@achultman.com
- Telegram: https://t.me/achultman
