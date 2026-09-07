/**
 * Request-header helpers for protected preview environments.
 */

function sameOrigin(candidate, baseUrl) {
  try {
    return new URL(candidate).origin === new URL(baseUrl).origin;
  } catch {
    return false;
  }
}

function buildVercelRequestHeaders(secret) {
  const normalized = String(secret || '').trim();
  if (!normalized) return {};

  return {
    'x-vercel-protection-bypass': normalized,
    'x-vercel-set-bypass-cookie': 'true',
  };
}

async function attachScopedRequestHeaders({ page, baseUrl, requestHeaders }) {
  if (!requestHeaders || Object.keys(requestHeaders).length === 0) return;

  await page.route('**/*', async (route) => {
    const request = route.request();
    if (!sameOrigin(request.url(), baseUrl)) {
      await route.continue();
      return;
    }

    await route.continue({
      headers: {
        ...request.headers(),
        ...requestHeaders,
      },
    });
  });
}

function isVercelProtectionRedirect(candidate, baseUrl) {
  try {
    const parsed = new URL(candidate);
    return (
      parsed.origin !== new URL(baseUrl).origin &&
      parsed.hostname.toLowerCase() === 'vercel.com' &&
      parsed.pathname === '/sso-api'
    );
  } catch {
    return false;
  }
}

function assertNoVercelProtectionRedirect(candidate, baseUrl) {
  if (!isVercelProtectionRedirect(candidate, baseUrl)) return;
  throw new Error(
    'The preview redirected to Vercel Authentication. Store the project automation-bypass secret in GitHub Actions and pass it as vercel_protection_bypass.',
  );
}

module.exports = {
  buildVercelRequestHeaders,
  attachScopedRequestHeaders,
  isVercelProtectionRedirect,
  assertNoVercelProtectionRedirect,
};
