import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Success() {
  const router = useRouter();
  const license = typeof router.query.license === 'string' ? router.query.license : '';

  return (
    <main style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif', padding: 24, maxWidth: 720, margin: '0 auto' }}>
      <Head>
        <title>PR QA Copilot — Success</title>
      </Head>
      <h1 style={{ fontSize: 32, marginTop: 24 }}>Payment complete</h1>
      <p style={{ color: '#4b5563' }}>
        Your Pro license key is below. (It becomes valid once Stripe marks the subscription active.)
      </p>

      <div style={{ marginTop: 16, padding: 16, border: '1px solid #e5e7eb', borderRadius: 12, background: '#f9fafb' }}>
        <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>LICENSE KEY</div>
        <code style={{ display: 'block', marginTop: 8, fontSize: 14 }}>{license || '(missing)'} </code>
      </div>

      <h2 style={{ marginTop: 24, fontSize: 18 }}>Next steps</h2>
      <ol style={{ color: '#374151' }}>
        <li>Add this as a GitHub Actions secret (e.g. <code>PR_QA_LICENSE_KEY</code>).</li>
        <li>Pass it into the action input <code>license_key</code>.</li>
      </ol>
    </main>
  );
}
