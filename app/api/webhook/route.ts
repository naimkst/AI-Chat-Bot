// /app/api/webhook/route.ts
import Stripe from 'stripe';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma'; // or your DB connector

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // ✅ Listen for subscription success
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.userId;
    const price = session.metadata?.planPrice;
    const stripeCustomerId = session.customer as string;

    // ✅ Save to database
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionPlan: price,
        stripeCustomerId,
        subscriptionStatus: 'active',
      },
    });
  }

  return new Response('ok', { status: 200 });
}