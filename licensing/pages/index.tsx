import Head from 'next/head';
import { useState } from 'react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Checkout failed');
      setLoading(false);
    }
  };

  return (
    <main style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif', padding: 24, maxWidth: 720, margin: '0 auto' }}>
      <Head>
        <title>PR QA Copilot — Pro</title>
      </Head>
      <h1 style={{ fontSize: 36, marginTop: 24 }}>PR QA Copilot — Pro</h1>
      <p style={{ color: '#4b5563' }}>
        Buy a Pro license to enable gated features (starting with pixel diffs). After payment, you&apos;ll receive a license key.
      </p>

      <div style={{ marginTop: 24, padding: 16, border: '1px solid #e5e7eb', borderRadius: 12 }}>
        <label style={{ display: 'block', fontWeight: 600 }}>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          style={{ width: '100%', marginTop: 8, padding: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}
        />
        {error ? <p style={{ color: '#b91c1c', marginTop: 8 }}>{error}</p> : null}
        <button
          onClick={startCheckout}
          disabled={loading || !email.includes('@')}
          style={{ marginTop: 12, padding: '12px 16px', borderRadius: 10, border: 'none', background: '#4f46e5', color: 'white', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Redirecting…' : 'Buy Pro'}
        </button>
      </div>

      <p style={{ marginTop: 16, color: '#6b7280', fontSize: 14 }}>
        You will use the license key as <code>license_key</code> input (or a secret wired into it) in your GitHub Action workflow.
      </p>
    </main>
  );
}
