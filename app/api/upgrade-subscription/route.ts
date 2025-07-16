import Stripe from 'stripe';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma'; // adjust path as needed

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(req: NextRequest) {
  try {
    const { subscriptionId, newPriceId, userId } = await req.json();

    if (!subscriptionId || !newPriceId || !userId) {
      return new Response(JSON.stringify({ error: 'Missing parameters' }), { status: 400 });
    }

    // Get the existing subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Update the subscription on Stripe
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: newPriceId,
      }],
      proration_behavior: 'create_prorations',
    });

    // Get updated plan details
    const price = await stripe.prices.retrieve(newPriceId);

    const amount = price.unit_amount ?? 0;
    const interval = (price.recurring?.interval || 'month');

    // ✅ Update UserSubscription in your database
    await prisma.userSubscription.updateMany({
      where: {
        userId,
        stripeSubscriptionId: subscriptionId,
      },
      data: {
        planAmount: amount,
        interval,
        status: updatedSubscription.status,
      },
    });

    return new Response(JSON.stringify({
      success: true,
      subscription: updatedSubscription,
    }), {
      status: 200,
    });

  } catch (error: any) {
    console.error('Upgrade Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}