'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LoaderIcon } from 'lucide-react';
import { toast } from '@/components/toast';

type Plan = {
  name: string;
  price: number;
  features: string[];
  stripePriceId?: string;
  popular?: boolean;
  current?: boolean;
};

const plans: Plan[] = [
  {
    name: 'Free',
    price: 0,
    features: [
      '5 messages total',
    ],
    current: true,
  },
  {
    name: 'Pro',
    price: 10,
    stripePriceId: 'price_12345_PRO', // replace with your real Stripe price ID
    popular: true,
    features: [
      '100 messages per month',
    ],
  },
  {
    name: 'Premium',
    price: 20,
    stripePriceId: 'price_12345_PREMIUM', // replace with your real Stripe price ID
    features: [
      '200 messages per month',
    ],
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [plandetails, setPlanDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

    const { loading, authenticated, user }: any = useAuth();

  const handleSubscribe = async (priceId?: string) => {
    if (!priceId) return;
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({ userId: user?.id,priceId: priceId }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();
    if (data?.url) {
      window.location.href = data.url;
    } else {
      alert('Something went wrong!');
    }
  };

   const cancelSubscription = async () => {
    const res = await fetch('/api/cancel-subscription', {
      method: 'POST',
      body: JSON.stringify({ userId: user?.id }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      window.location.href = '/pricing';
      toast({
        type: 'success',
        description: 'Subscription canceled successfully',
      });
    } else {
      toast({
        type: 'error',
        description: 'Failed to cancel subscription',
      });
    }
   };
  
  


  useEffect(() => {
    async function fetchPlan() {
      if (!user?.id) return;
      try {
        const res = await fetch(`/api/subscription?user_id=${user?.id}`);
        const data = await res.json();
        if (res.ok) {
          setPlanDetails(data.subscription);
        } else {
          setError(data.error);
        }
      } catch (e) {
        setError('Failed to fetch subscription');
      }
    }

    fetchPlan();
  }, [user?.id]);




  // if (!user) {
  //   router.push('/login');
  //   return;
  // }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-16">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-5xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Plans & Billing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className="rounded-xl border border-gray-200 p-6 flex flex-col items-center text-center"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {plan.name}
              </h3>
              {plan.popular && (
                <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full mb-2">
                  Popular
                </span>
              )}
              <p className="text-3xl font-bold mb-1 text-neutral-500">${plan.price}</p>
              <p className="text-sm text-gray-500 mb-4">/month</p>

              <ul className="text-sm text-gray-700 mb-6 space-y-1">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center justify-center gap-2">
                    <span className="text-green-600">✔</span>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* { index == 0 ? (
                <button
                  className="bg-gray-100 text-gray-500 font-medium px-6 py-2 rounded w-full"
                >
                 {plan?.price * 100 == plandetails?.planAmount ? 'Current Plan' : 'Subscribe'}
                </button>
              ) : (
                  <button
                    disabled={plan?.price * 100 == plandetails?.planAmount}
                  onClick={() =>  plan?.price * 100 == plandetails?.planAmount ? cancelSubscription() :  handleSubscribe(plan?.price?.toString())}
                  className={`${plan?.price * 100 == plandetails?.planAmount ? 'bg-gray-100 text-gray-500 font-medium px-6 py-2 rounded w-full' : 'bg-gray-800 hover:bg-gray-700 text-white font-medium px-6 py-2 rounded w-full'}`}
                >
                  {plan?.price * 100 == plandetails?.planAmount ? 'Current Plan' : 'Subscribe'}
                </button>
              )} */}

              <button
                    disabled={plan?.price * 100 == plandetails?.planAmount}
                  onClick={() =>  plan?.price * 100 == plandetails?.planAmount ? cancelSubscription() :  handleSubscribe(plan?.price?.toString())}
                  className={`${plan?.price * 100 == plandetails?.planAmount ? 'bg-gray-100 text-gray-500 font-medium px-6 py-2 rounded w-full' : 'bg-gray-800 hover:bg-gray-700 text-white font-medium px-6 py-2 rounded w-full'}`}
                >
                  {plan?.price * 100 == plandetails?.planAmount ? 'Current Plan' : 'Subscribe'}
                </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}