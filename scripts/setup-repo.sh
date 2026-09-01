#!/usr/bin/env bash
# One-time setup after the GitHub repo exists and `origin` is linked.
# Requires the gh CLI, authenticated (`gh auth login`).
set -euo pipefail

repo="$(gh repo view --json nameWithOwner -q .nameWithOwner)"
echo "Configuring $repo"

gh repo edit "$repo" --enable-auto-merge

# Require the CI build to pass before a PR can merge (auto-merge waits on this).
gh api "repos/$repo/branches/main/protection" -X PUT \
  -H "Accept: application/vnd.github+json" \
  --input - <<'JSON'
{
  "required_status_checks": { "strict": true, "contexts": ["build"] },
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null
}
JSON

echo "Done. Auto-merge enabled; main protected requiring the 'build' check."
echo "Still needed before the automation can run end to end:"
echo "  gh secret set LINKEDIN_ACCESS_TOKEN"
echo "  gh secret set LINKEDIN_AUTHOR_URN"
echo "  gh variable set SITE_URL --body https://<your-vercel-domain>"
