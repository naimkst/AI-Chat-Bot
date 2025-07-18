import Stripe from 'stripe';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(req: NextRequest) {
  try {
    const { priceId, userId } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing userId' }), { status: 400 });
    }

    const subscription = await prisma.userSubscription.findFirst({
      where: { userId },
    });


    if(subscription){
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    }

    if (subscription) {
      await prisma.userSubscription.delete({
        where: { userId },
      });
    }


    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Monthly Subscription',
              description: 'Access to premium features',
            },
            unit_amount: Number(priceId) * 100,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      success_url: 'http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:3000/pricing',
      metadata: {
        userId: userId,
        planPrice: Number(priceId) * 100,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
    });
  } catch (error: any) {
    console.error('Stripe Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}