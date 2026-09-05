import Head from 'next/head';
import Image from 'next/image';

const pilotEmail =
  'mailto:adam@achultman.com?subject=PR%20QA%20Copilot%20paid%20pilot&body=Hi%20Adam%2C%0A%0AI%27d%20like%20to%20run%20PR%20QA%20Copilot%20on%20our%20repos.%0A%0ACompany%3A%0ARepos%3A%0APreview%20platform%3A%0A';

export default function Home() {
  return (
    <>
      <Head>
        <title>PR QA Copilot | Runtime QA on every pull request</title>
        <meta
          name="description"
          content="Run browser checks against every preview deployment. Catch broken routes, console errors, failed requests, and visual changes before review."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <header className="siteHeader">
        <a className="wordmark" href="#top" aria-label="PR QA Copilot home">
          <span className="mark" aria-hidden="true">PR</span>
          <span>QA Copilot</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#product">Product</a>
          <a href="#pricing">Pricing</a>
          <a href="https://github.com/ACHultman/pr-qa-copilot">GitHub</a>
          <a className="navCta" href={pilotEmail}>Start a pilot</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero shell">
          <div className="heroCopy">
            <p className="eyebrow">QA for preview deployments</p>
            <h1>Every PR gets checked before review.</h1>
            <p className="heroText">Catch broken routes, runtime errors, failed requests, and visual changes in one pull request report.</p>
            <div className="heroActions">
              <a className="button primary" href={pilotEmail}>Start a pilot</a>
              <a className="button secondary" href="https://github.com/ACHultman/pr-qa-copilot">View source</a>
            </div>
          </div>

          <figure className="heroVisual">
            <Image
              src="/pr-qa-report-hero.png"
              alt="Illustrative PR QA report with route, console, network, and visual checks"
              width={1536}
              height={1024}
              priority
            />
            <figcaption>Illustrative product view</figcaption>
          </figure>
        </section>

        <section className="signalBar" aria-label="Product capabilities">
          <span>GitHub Actions</span>
          <span>Playwright</span>
          <span>Vercel and Netlify previews</span>
          <span>One report per PR</span>
        </section>

        <section className="shell product" id="product">
          <div className="sectionIntro">
            <h2>Review the change, not the setup.</h2>
            <p>PR QA Copilot opens the preview, inspects the routes that changed, and leaves the evidence where your team already works.</p>
          </div>

          <div className="featureGrid">
            <article className="feature featureWide">
              <h3>See failures a screenshot cannot show.</h3>
              <p>Console exceptions, page crashes, failed fetches, and same-origin HTTP errors are captured with the route that caused them.</p>
              <div className="codeSample" aria-label="Example runtime report">
                <code><span>GET</span> /api/subscription</code>
                <code className="errorLine">500 Internal Server Error</code>
                <code><span>route</span> /settings/billing</code>
              </div>
            </article>

            <article className="feature featureDark">
              <h3>Changed routes join your core paths.</h3>
              <p>Static Next.js routes touched by the pull request are added automatically. Your configured smoke-test routes always run.</p>
            </article>

            <article className="feature featureLine">
              <h3>One durable artifact.</h3>
              <p>Each run stores screenshots, issue details, visual diffs, and a browsable HTML gallery.</p>
            </article>

            <article className="feature featureAccent">
              <h3>Informational first. Blocking when ready.</h3>
              <p>Start without slowing delivery. Turn on check failures after the routes and expected console patterns are tuned.</p>
            </article>
          </div>
        </section>

        <section className="workflow shell" aria-labelledby="workflow-title">
          <h2 id="workflow-title">Fits the pull request you already have.</h2>
          <div className="workflowTrack">
            <article>
              <strong>Connect</strong>
              <p>Add one workflow and point it at your preview URL.</p>
            </article>
            <article>
              <strong>Exercise</strong>
              <p>Playwright visits core and changed routes after every update.</p>
            </article>
            <article>
              <strong>Review</strong>
              <p>The pull request gets a concise verdict plus full evidence.</p>
            </article>
          </div>
        </section>

        <section className="pricing shell" id="pricing">
          <div className="pricingCopy">
            <h2>Start with a paid pilot.</h2>
            <p>We install the workflow, tune noisy routes, and prove the report on real pull requests. Month to month.</p>
          </div>

          <div className="plans">
            <article className="plan primaryPlan">
              <div>
                <p className="planName">Team pilot</p>
                <p className="price"><span>$399</span> / month</p>
                <p className="planSummary">For one product team shipping a web app.</p>
              </div>
              <ul>
                <li>Up to 3 repositories</li>
                <li>Hands-on setup and route tuning</li>
                <li>Runtime checks and screenshot artifacts</li>
                <li>Visual baselines and PR check gating</li>
                <li>Month-to-month cancellation</li>
              </ul>
              <a className="button primary" href={pilotEmail}>Start a pilot</a>
            </article>

            <article className="plan agencyPlan">
              <div>
                <p className="planName">Agency pilot</p>
                <p className="price"><span>$999</span> / month</p>
                <p className="planSummary">For agencies standardizing QA across client work.</p>
              </div>
              <ul>
                <li>Up to 10 repositories</li>
                <li>Reusable onboarding template</li>
                <li>Private preview and auth-flow support</li>
                <li>Priority tuning for flaky routes</li>
                <li>Monthly coverage review</li>
              </ul>
              <a className="button inverted" href={pilotEmail}>Start a pilot</a>
            </article>
          </div>
        </section>

        <section className="faq shell" aria-labelledby="faq-title">
          <h2 id="faq-title">A few practical answers.</h2>
          <div className="faqGrid">
            <article>
              <h3>We already use Playwright.</h3>
              <p>Keep it. This adds automatic route coverage and a reviewer-friendly report to every pull request.</p>
            </article>
            <article>
              <h3>Will it block releases?</h3>
              <p>Only when you choose. Pilots begin in reporting mode, then enable blocking after the signal is clean.</p>
            </article>
            <article>
              <h3>What about authenticated pages?</h3>
              <p>We wire in a test account, stored session, or token strategy during onboarding.</p>
            </article>
            <article>
              <h3>Can it reach private previews?</h3>
              <p>Yes, when the GitHub runner can authenticate to the preview or reach your internal staging environment.</p>
            </article>
          </div>
        </section>

        <section className="closing shell">
          <h2>Put QA evidence on the next PR.</h2>
          <a className="button primary" href={pilotEmail}>Start a pilot</a>
        </section>
      </main>

      <footer className="siteFooter shell">
        <p>PR QA Copilot</p>
        <div>
          <a href="mailto:adam@achultman.com">adam@achultman.com</a>
          <a href="https://github.com/ACHultman/pr-qa-copilot">GitHub</a>
        </div>
      </footer>
    </>
  );
}
