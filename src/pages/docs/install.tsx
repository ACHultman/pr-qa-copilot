import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';

const Install: NextPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Install PR QA Copilot — 5-minute setup</title>
        <meta
          name="description"
          content="Install PR QA Copilot in 5 minutes. Add the GitHub Action, configure your pages, and start reviewing PRs faster."
        />
      </Head>

      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <Link href="/" className="font-bold text-gray-900">
          PR QA Copilot
        </Link>
        <Link
          href="/"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          Back to home
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight leading-tight">
          Install in 5 minutes
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Add the GitHub Action, configure your pages, and start reviewing PRs faster.
        </p>
      </section>

      {/* Steps */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-6">
          <div className="space-y-12">
            {[
              {
                num: '1',
                title: 'Add the GitHub Action',
                desc: (
                  <div>
                    <p>
                      Create <code>.github/workflows/pr-qa.yml</code> in your repo:
                    </p>
                    <pre className="mt-3 rounded-lg bg-gray-100 p-4 text-sm overflow-x-auto">
{`name: PR QA Copilot
on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  pr-qa:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install -g @pr-qa/copilot
      - run: pr-qa-copilot run --config pr-qa.config.json
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          PR_QA_AUTH_TOKEN: ${{ secrets.PR_QA_AUTH_TOKEN }} # optional`}
                    </pre>
                  </div>
                ),
              },
              {
                num: '2',
                title: 'Configure your pages',
                desc: (
                  <div>
                    <p>
                      Create <code>pr-qa.config.json</code> in your repo root:
                    </p>
                    <pre className="mt-3 rounded-lg bg-gray-100 p-4 text-sm overflow-x-auto">
{`{
  "pages": [
    "/",
    "/about",
    "/pricing",
    "/contact"
  ],
  "viewport": {
    "width": 1280,
    "height": 800
  },
  "waitForSelector": ".loaded" // optional
}`}
                    </pre>
                  </div>
                ),
              },
              {
                num: '3',
                title: 'Commit and push',
                desc: (
                  <div>
                    <p>Commit the workflow and config files:</p>
                    <pre className="mt-3 rounded-lg bg-gray-100 p-4 text-sm overflow-x-auto">
{`git add .github/workflows/pr-qa.yml pr-qa.config.json
git commit -m "Add PR QA Copilot"
git push`}
                    </pre>
                    <p className="mt-4 text-sm text-gray-500">
                      The Action will run on the next PR and post a comment with a download link.
                    </p>
                  </div>
                ),
              },
            ].map(({ num, title, desc }) => (
              <div key={num} className="flex gap-6">
                <div className="h-10 w-10 shrink-0 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">
                  {num}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                  <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                    {desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Optional */}
          <div className="mt-16 rounded-2xl border border-gray-100 bg-gray-50 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Optional: Authentication</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              If your preview requires authentication, add a <code>PR_QA_AUTH_TOKEN</code>{' '}
              secret to your repo settings and pass it to the Action. The token will be used to log in before capturing screenshots.
            </p>
          </div>

          {/* Troubleshooting */}
          <div className="mt-12 rounded-2xl border border-gray-100 bg-gray-50 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Troubleshooting</h3>
            <div className="space-y-4 text-sm text-gray-600">
              <div>
                <p className="font-semibold text-gray-900">Action fails with "No preview URL"</p>
                <p>
                  Ensure your Vercel/Netlify preview URLs are enabled and the Action has access to the{' '}
                  <code>GITHUB_TOKEN</code> secret.
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Screenshots are blank</p>
                <p>
                  Add a <code>waitForSelector</code> to your config to wait for a specific element to load before capturing.
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Action times out</p>
                <p>
                  Reduce the number of pages in your config or increase the timeout in the Action YAML.
                </p>
              </div>
            </div>
          </div>

          {/* Next steps */}
          <div className="mt-12 text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Next steps</h3>
            <p className="text-sm text-gray-600">
              <Link href="/" className="text-indigo-600 hover:text-indigo-700">
                Back to home
              </Link>{' '}
              or{' '}
              <a href="mailto:support@prqacopilot.com" className="text-indigo-600 hover:text-indigo-700">
                email support
              </a>{' '}
              if you need help.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Install;
