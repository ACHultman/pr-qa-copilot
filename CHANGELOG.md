# Changelog

All notable changes to this project will be documented in this file.

## 0.5.2
- Make `expectText` wait and retry across client-side navigation before failing

## 0.5.1
- Normalize visible whitespace in `expectText` journey assertions
- Show journey failure details directly in the pull request report

## 0.5.0
- Added protected Vercel preview access through `vercel_protection_bypass`
- Scoped bypass headers to the preview origin and masked the secret in Actions logs
- Added an actionable error for unconfigured Vercel Authentication redirects

## 0.4.0
- Added automatic preview discovery from successful GitHub Deployments attached to the pull request head commit
- Prefer transient and non-production deployments, and reject stale environment URLs when the latest deployment status is not successful
- Made `base_url` an optional override and added a bounded `preview_wait_seconds` input
- Added a `tested_url` output and an end-to-end self-test for deployment discovery

## 0.3.0
- Added declarative Playwright journeys for critical multi-step flows
- Added environment-backed journey values for nonproduction test credentials
- Added journey verdicts and final-state screenshots to PR comments and artifacts

## 0.2.0
- Added route-level console, page, request, and HTTP failure detection
- Added automatic coverage for changed static Next.js routes
- Added report-first and merge-blocking modes with durable evidence artifacts
- Added action outputs for pass/fail state, issue count, and routes tested
- Repaired manual self-demo runs and moved the action runtime to Node.js 24
- Launched the paid-pilot product site and aligned pricing and onboarding material

## 0.1.0
- Pilot-readiness docs (onboarding, pricing, agreement)
- Added unit tests for core markdown/path helpers
- Added workflow_dispatch self-demo and `scripts/demo.sh`
- MVP composite action:
  - deterministic PR summary
  - optional OpenAI PR summary
  - Playwright screenshot pack + optional pixel diffs
  - artifact upload with HTML gallery
