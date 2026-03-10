import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';

const Home: NextPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>PR QA Copilot — Automated PR Reviews with Playwright</title>
        <meta
          name="description"
          content="PR QA Copilot runs Playwright tests on every PR and posts a visual diff pack with screenshots, so you can review changes in minutes, not hours."
        />
      </Head>

      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <span className="font-bold text-gray-900">PR QA Copilot</span>
        <Link
          href="#pricing"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          Get started →
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
          Automated PR reviews with Playwright.
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-xl mx-auto">
          PR QA Copilot runs Playwright tests on every PR and posts a visual diff pack with screenshots, so you can review changes in minutes, not hours.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="#pricing"
            className="rounded-xl bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-sm shadow-indigo-600/20 hover:bg-indigo-700 transition-colors"
          >
            Get started →
          </Link>
          <Link
            href="#how-it-works"
            className="rounded-xl border border-gray-200 bg-white px-8 py-4 text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            How it works →
          </Link>
        </div>
        <p className="mt-4 text-sm text-gray-500">Free for public repos. No credit card required.</p>
      </section>

      {/* Problem */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">The PR review bottleneck</h2>
          <p className="text-gray-600 mb-6">
            You know the drill:
          </p>
          <div className="space-y-4">
            {[
              {
                title: 'Manual screenshot capture',
                body: 'Someone has to manually open the PR, navigate to key pages, and capture screenshots. This takes 15-30 minutes per PR.',
              },
              {
                title: 'Visual regressions slip through',
                body: 'Without automated visual diffs, you miss subtle layout shifts, color changes, and responsive issues until they hit production.',
              },
              {
                title: 'Reviewers waste time on setup',
                body: 'Reviewers spend time setting up the PR environment instead of reviewing the actual changes.',
              },
              {
                title: 'No single source of truth',
                body: 'Screenshots are scattered across Slack, email, and GitHub comments. No one has the full picture.',
              },
            ].map(({ title, body }) => (
              <div key={title} className="flex gap-4">
                <span className="mt-1 h-5 w-5 shrink-0 text-red-500">✗</span>
                <div>
                  <p className="font-semibold text-gray-900">{title}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16" id="how-it-works">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">How it works</h2>
          <div className="space-y-8">
            {[
              [
                '1',
                'Define key pages',
                'Add a config file to your repo listing the URLs you want to capture (e.g., /, /about, /pricing).',
              ],
              [
                '2',
                'Run on every PR',
                'The GitHub Action runs Playwright on the PR preview URL and captures screenshots for each page.',
              ],
              [
                '3',
                'Post visual diff pack',
                'A GitHub comment is posted with a link to a zip of screenshots + optional visual diffs against main.',
              ],
              [
                '4',
                'Review in minutes',
                'Reviewers download the zip, unzip, and review the screenshots in their browser — no setup required.',
              ],
            ].map(([num, title, desc]) => (
              <div key={num} className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">
                  {num}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{title}</p>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo GIF placeholder */}
      <section className="bg-indigo-50 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">See it in action</h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            A Playwright test runs on the PR preview URL, captures screenshots, and posts a comment with a download link.
          </p>
          <div className="mt-6 rounded-xl border-2 border-dashed border-indigo-200 bg-white p-12 text-gray-400">
            <p>[Demo GIF placeholder]</p>
            <p className="mt-2 text-sm">Visual diff pack generated and posted to PR #123</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16" id="pricing">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Pricing</h2>
          <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="rounded-xl border border-gray-100 p-5 text-left">
              <p className="font-bold text-gray-900">Free</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">$0</p>
              <ul className="mt-3 space-y-1.5 text-sm text-gray-600">
                <li>✓ Public repos</li>
                <li>✓ 100 runs/month</li>
                <li>✓ Screenshot pack</li>
                <li>✓ GitHub comment</li>
              </ul>
            </div>
            <div className="relative rounded-xl border-2 border-indigo-600 p-5 text-left">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-semibold text-white">
                Most popular
              </div>
              <p className="font-bold text-gray-900">Pro</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">$99<span className="text-sm font-normal text-gray-500">/mo</span></p>
              <ul className="mt-3 space-y-1.5 text-sm text-gray-600">
                <li>✓ Everything in Free</li>
                <li>✓ Private repos</li>
                <li>✓ 10,000 runs/month</li>
                <li>✓ Visual diffs</li>
                <li>✓ Priority support</li>
              </ul>
            </div>
            <div className="rounded-xl border border-gray-100 p-5 text-left">
              <p className="font-bold text-gray-900">Enterprise</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">Custom</p>
              <ul className="mt-3 space-y-1.5 text-sm text-gray-600">
                <li>✓ Everything in Pro</li>
                <li>✓ Unlimited runs</li>
                <li>✓ Self-hosted</li>
                <li>✓ SSO + SAML</li>
              </ul>
            </div>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            <strong>Founding pricing.</strong> These prices increase after the first 50 customers.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently asked</h2>
          <div className="space-y-6 divide-y divide-gray-200">
            {[
              {
                q: 'What frameworks does this work with?',
                a: 'Any framework that can be previewed on a URL: Next.js, Gatsby, SvelteKit, Astro, Remix, etc. If you can open it in a browser, Playwright can screenshot it.',
              },
              {
                q: 'How do I configure the pages to capture?',
                a: 'Add a `pr-qa.config.json` file to your repo with an array of URLs. Example: `{"pages": ["/", "/about", "/pricing"]}`.',
              },
              {
                q: 'Can I run it locally first?',
                a: 'Yes. Run `npx @pr-qa/copilot test --url http://localhost:3000` to generate a local screenshot pack before committing.',
              },
              {
                q: 'What about authentication?',
                a: 'If your preview requires auth, pass a `PR_QA_AUTH_TOKEN` secret to the Action. The token will be used to log in before capturing screenshots.',
              },
              {
                q: 'How do visual diffs work?',
                a: 'On Pro, we compare the PR screenshots against the same URLs on `main` using pixelmatch and post a diff pack showing changes.',
              },
              {
                q: 'Is there a free trial?',
                a: 'Yes. The Free tier works for public repos with no credit card required. Try it on your next PR.',
              },
            ].map(({ q, a }) => (
              <div key={q} className="pt-6 first:pt-0">
                <p className="font-semibold text-gray-900">{q}</p>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-gray-900 py-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Review PRs in minutes, not hours.</h2>
        <p className="text-gray-400 mb-8">Free for public repos. No credit card required.</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="#pricing"
            className="rounded-xl bg-white px-8 py-4 text-base font-semibold text-gray-900 hover:bg-gray-100 transition-colors"
          >
            Get started →
          </Link>
          <Link
            href="/docs/install"
            className="rounded-xl border border-gray-600 px-8 py-4 text-base font-semibold text-white hover:border-gray-400 transition-colors"
          >
            Install docs →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        <p>PR QA Copilot — Automated PR reviews with Playwright.</p>
      </footer>
    </div>
  );
};

export default Home;
