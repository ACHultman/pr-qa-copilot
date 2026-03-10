import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY || '';
const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!stripeSecret) return res.status(500).json({ error: 'Stripe not configured' });

  const key = String(req.query.key || '').trim();
  if (!key) return res.status(400).json({ error: 'key required' });

  // Stripe Search API (Subscription) supports metadata queries.
  const query = `metadata['license_key']:'${key.replace(/'/g, "\\'")}'`;

  const subs = await stripe.subscriptions.search({
    query,
    limit: 1,
  });

  const sub = subs.data[0];
  if (!sub) return res.status(404).json({ valid: false, error: 'not_found' });

  const status = sub.status;
  const valid = status === 'active' || status === 'trialing';

  return res.status(200).json({ valid, plan: 'pro', status });
}
