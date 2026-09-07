const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildVercelRequestHeaders,
  attachScopedRequestHeaders,
  isVercelProtectionRedirect,
  assertNoVercelProtectionRedirect,
} = require('../src/request-headers');

test('buildVercelRequestHeaders creates the documented automation headers', () => {
  assert.deepEqual(buildVercelRequestHeaders(' secret-value '), {
    'x-vercel-protection-bypass': 'secret-value',
    'x-vercel-set-bypass-cookie': 'true',
  });
  assert.deepEqual(buildVercelRequestHeaders(''), {});
});

test('attachScopedRequestHeaders sends secrets only to the preview origin', async () => {
  let handler;
  const page = {
    async route(pattern, callback) {
      assert.equal(pattern, '**/*');
      handler = callback;
    },
  };
  await attachScopedRequestHeaders({
    page,
    baseUrl: 'https://preview.example.com',
    requestHeaders: {
      'x-vercel-protection-bypass': 'secret-value',
    },
  });

  let sameOriginOptions;
  await handler({
    request() {
      return {
        url: () => 'https://preview.example.com/app.js',
        headers: () => ({ accept: '*/*' }),
      };
    },
    async continue(options) {
      sameOriginOptions = options;
    },
  });
  assert.deepEqual(sameOriginOptions, {
    headers: {
      accept: '*/*',
      'x-vercel-protection-bypass': 'secret-value',
    },
  });

  let thirdPartyOptions = 'not-called';
  await handler({
    request() {
      return {
        url: () => 'https://analytics.example.net/collect',
        headers: () => ({ accept: '*/*' }),
      };
    },
    async continue(options) {
      thirdPartyOptions = options;
    },
  });
  assert.equal(thirdPartyOptions, undefined);
});

test('Vercel SSO redirects are detected without flagging normal app redirects', () => {
  const baseUrl = 'https://preview.example.com';
  assert.equal(
    isVercelProtectionRedirect(
      'https://vercel.com/sso-api?url=https%3A%2F%2Fpreview.example.com',
      baseUrl,
    ),
    true,
  );
  assert.equal(isVercelProtectionRedirect('https://accounts.example.com/login', baseUrl), false);
  assert.doesNotThrow(() =>
    assertNoVercelProtectionRedirect('https://preview.example.com/dashboard', baseUrl),
  );
  assert.throws(
    () =>
      assertNoVercelProtectionRedirect(
        'https://vercel.com/sso-api?url=https%3A%2F%2Fpreview.example.com',
        baseUrl,
      ),
    /vercel_protection_bypass/,
  );
});
