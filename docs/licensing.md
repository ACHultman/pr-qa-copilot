# PR QA Copilot — Stripe licensing (pilot-ready)

This repo includes a minimal licensing server under `licensing/`.

## What it does
- Creates a Stripe Checkout Session (subscription) and generates a **license key** (UUID).
- Stores `license_key` in **Stripe subscription metadata**.
- Exposes `GET /api/validate?key=...` so the GitHub Action can enable Pro-only features (starting with pixel diffs).

## Deploy (Vercel)
1. Create a new Vercel project.
2. Set the **Root Directory** to `licensing/`.
3. Set env vars:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PRICE_ID` (the recurring price for Pro)
   - `NEXT_PUBLIC_BASE_URL` (e.g. `https://prqacopilot.com`)

## Buy a license
Visit the deployed root URL, enter an email, and complete Stripe checkout.

## Use the key in the Action
In the customer repo:
- Add a secret: `PR_QA_LICENSE_KEY` (the license key from the success page)
- Pass it into the action:

```yml
- uses: ACHultman/pr-qa-copilot@v0
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    base_url: ${{ vars.PREVIEW_URL }}
    license_key: ${{ secrets.PR_QA_LICENSE_KEY }}
```

## Notes / limitations
- A generated key only becomes **valid** once Stripe has an active/trialing subscription with that key in metadata.
- This is intentionally minimal for pilots; v1 can add teams/seats, revocation, and an admin UI.
