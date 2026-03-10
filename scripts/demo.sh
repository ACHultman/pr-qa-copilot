#!/usr/bin/env bash
set -euo pipefail

# Run the self-demo workflow via workflow_dispatch.
#
# Usage:
#   ./scripts/demo.sh \
#     --base-url "https://example.com" \
#     --paths "/\n/pricing\n/docs"
#
# Notes:
# - Requires `gh` authenticated.
# - The workflow also runs automatically on PRs.

BASE_URL="https://example.com"
PATHS="/"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --base-url)
      BASE_URL="$2"; shift 2 ;;
    --paths)
      PATHS="$2"; shift 2 ;;
    -h|--help)
      sed -n '1,80p' "$0"; exit 0 ;;
    *)
      echo "Unknown arg: $1" >&2
      exit 1
      ;;
  esac
done

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI not found. Install from https://cli.github.com/" >&2
  exit 1
fi

echo "Running workflow: PR QA Copilot (self-demo)"
echo "  base_url: ${BASE_URL}"
echo -e "  paths:\n${PATHS}" | sed 's/^/    /'

gh workflow run "PR QA Copilot (self-demo)" \
  -f base_url="${BASE_URL}" \
  -f paths="${PATHS}"

echo
echo "Done. Watch the run in GitHub Actions:"
echo "  gh run list --limit 5"
