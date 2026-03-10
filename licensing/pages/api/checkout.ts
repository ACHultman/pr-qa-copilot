import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY || '';
const priceId = process.env.STRIPE_PRICE_ID || '';
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

const stripe = new Stripe(stripeSecret, {
  apiVersion: '2024-06-20',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!stripeSecret || !priceId) return res.status(500).json({ error: 'Stripe not configured' });

  const email = String(req.body?.email || '').trim();
  if (!email.includes('@')) return res.status(400).json({ error: 'Valid email required' });

  const licenseKey = crypto.randomUUID();

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/success?license=${licenseKey}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/`,
    subscription_data: {
      metadata: {
        license_key: licenseKey,
      },
    },
    metadata: {
      license_key: licenseKey,
    },
  });

  return res.status(200).json({ url: session.url, licenseKey });
}
