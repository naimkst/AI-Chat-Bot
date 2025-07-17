// app/api/fetch-subscription/route.ts
import Stripe from 'stripe';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id');
  
  if (!sessionId) {
    return new Response(JSON.stringify({ error: 'Missing session_id' }), { status: 400 });
  }

  try {
    // Get the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    const subscription = session.subscription as Stripe.Subscription;
    const userId = session.metadata?.userId; 

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing userId' }), { status: 400 });
    }

    const oneMonthLater = new Date(Date.now());
oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

    // Save to your database
   const userSubscription = await prisma.userSubscription.create({
  data: {
    userId: userId, // must be a valid ID from the User table
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: subscription.customer as string,
    planAmount: subscription.items.data[0].price.unit_amount ?? 0,
    status: subscription.status,
    interval: subscription.items.data[0].price.recurring?.interval ?? 'month',
    currentPeriodEnd: oneMonthLater,
  },
   });
    
    if(userSubscription?.planAmount !== 0){
       await prisma.userSubscriptionUsage.update({
          where: { userId },
          data: {
            messageCount: 0,
            lastResetAt: new Date(),
          },
        });
    }
    
    return new Response(JSON.stringify(subscription), { status: 200 });
  } catch (err: any) {
    console.error('Error fetching subscription:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}