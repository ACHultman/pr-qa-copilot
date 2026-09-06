import Head from 'next/head';
import Image from 'next/image';

const pilotEmail =
  'mailto:adam@hultman.dev?subject=PR%20QA%20Copilot%20paid%20pilot&body=Hi%20Adam%2C%0A%0AI%27d%20like%20to%20run%20PR%20QA%20Copilot%20on%20our%20repos.%0A%0ACompany%3A%0ARepos%3A%0APreview%20platform%3A%0A';

export default function Home() {
  return (
    <>
      <Head>
        <title>PR QA Copilot | Critical journey QA on every pull request</title>
        <meta
          name="description"
          content="Automatically find each pull request preview, run critical browser journeys, and catch broken sign-in, checkout, runtime errors, and failed requests before review."
        />
        <meta name="application-name" content="PR QA Copilot" />
        <meta name="author" content="Adam Hultman" />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href="https://pr-qa-copilot.vercel.app" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="PR QA Copilot" />
        <meta property="og:url" content="https://pr-qa-copilot.vercel.app" />
        <meta property="og:title" content="PR QA Copilot | Critical journey QA on every pull request" />
        <meta
          property="og:description"
          content="Automatically find the preview and prove sign-in, checkout, and other critical flows still work before a human reviews the pull request."
        />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="PR QA Copilot | Critical journey QA on every pull request" />
        <meta
          name="twitter:description"
          content="Automatic preview discovery, critical journey QA, and runtime evidence delivered in the pull request."
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
            <p className="eyebrow">Critical journey QA for every preview</p>
            <h1>Know the critical flow still works before review.</h1>
            <p className="heroText">The action finds the successful preview, runs sign-in, checkout, and other multi-step journeys, then puts the verdict and failure screenshot on the pull request.</p>
            <div className="heroActions">
              <a className="button primary" href={pilotEmail}>Start a pilot</a>
              <a className="button secondary" href="https://github.com/ACHultman/pr-qa-copilot#quick-start">Install free</a>
            </div>
          </div>

          <figure className="heroVisual">
            <Image
              src="/pr-qa-report-hero.png"
              alt="Illustrative PR QA report with journey, route, console, network, and visual checks"
              width={1536}
              height={1024}
              priority
            />
            <figcaption>Illustrative product view</figcaption>
          </figure>
        </section>

        <section className="signalBar" aria-label="Product capabilities">
          <span>GitHub Actions</span>
          <span>Declarative journeys</span>
          <span>Automatic preview discovery</span>
          <span>One report per PR</span>
        </section>

        <section className="shell product" id="product">
          <div className="sectionIntro">
            <h2>Test the route. Finish the job.</h2>
            <p>A page can load while the flow behind it is broken. PR QA Copilot opens the preview, completes your critical journeys, and leaves the evidence where your team already works.</p>
          </div>

          <div className="featureGrid">
            <article className="feature featureWide">
              <h3>Exercise the flow a page check misses.</h3>
              <p>Keep bounded browser journeys in your repository. Fill forms, click through the UI, and assert the text and URL that prove the flow completed.</p>
              <div className="codeSample" aria-label="Example critical journey report">
                <code><span>journey</span> Sign in and reach billing</code>
                <code><span>steps</span> 6 / 6 completed</code>
                <code><span>result</span> PASSED</code>
              </div>
            </article>

            <article className="feature featureDark">
              <h3>See failures a screenshot cannot show.</h3>
              <p>Console exceptions, page crashes, failed fetches, and same-origin HTTP errors are captured with the route or journey that caused them.</p>
            </article>

            <article className="feature featureLine">
              <h3>Changed routes join your core paths.</h3>
              <p>Static Next.js routes touched by the pull request are added automatically. Your configured smoke-test routes always run.</p>
            </article>

            <article className="feature featureAccent">
              <h3>One verdict. Evidence when it fails.</h3>
              <p>Each run stores route screenshots, journey final states, issue details, visual diffs, and a browsable HTML gallery. Begin in reporting mode, then block merges when the signal is clean.</p>
            </article>
          </div>
        </section>

        <section className="workflow shell" aria-labelledby="workflow-title">
          <h2 id="workflow-title">Fits the pull request you already have.</h2>
          <div className="workflowTrack">
            <article>
              <strong>Connect</strong>
              <p>Add one workflow. The action finds the successful preview attached to the pull request.</p>
            </article>
            <article>
              <strong>Exercise</strong>
              <p>Playwright visits core and changed routes, then completes the journeys you configured.</p>
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
                <li>Hands-on journey and route setup</li>
                <li>Runtime checks and failure screenshots</li>
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
              <p>Keep it for deep regression coverage. This handles the short critical flows you want on every pull request and gives reviewers one concise report.</p>
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
          <a href="mailto:adam@hultman.dev">adam@hultman.dev</a>
          <a href="https://github.com/ACHultman/pr-qa-copilot">GitHub</a>
        </div>
      </footer>
    </>
  );
}
