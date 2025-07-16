import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing userId' }), {
        status: 400,
      });
    }

    const subscription = await prisma.userSubscription.findFirst({
      where: { userId },
    });

    if (!subscription?.stripeSubscriptionId) {
      return new Response(JSON.stringify({ error: 'No active subscription found' }), {
        status: 404,
      });
    }

    // ✅ Use cancel(), not del()
    await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);

    await prisma.userSubscription.delete({
      where: { userId },
    });


    return new Response(JSON.stringify({ message: 'Subscription canceled successfully' }), {
      status: 200,
    });
  } catch (error: any) {
    console.error('Cancel Subscription Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}