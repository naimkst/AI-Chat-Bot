'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SuccessClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [message, setMessage] = useState('Saving your subscription...');

  useEffect(() => {
    if (!sessionId) return;

    async function saveSubscription() {
      try {
        const res = await fetch(`/api/fetch-subscription?session_id=${sessionId}`);
        const data = await res.json();

        if (res.ok) {
          setMessage('🎉 Subscription saved successfully!');
        } else {
          setMessage(`❌ Failed: ${data.error}`);
        }

        setTimeout(() => {
          window.location.href = '/pricing';
        }, 2000);
      } catch (error) {
        setMessage('❌ An error occurred.');
        setTimeout(() => {
          window.location.href = '/pricing';
        }, 2000);
      }
    }

    saveSubscription();
  }, [sessionId]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Subscription Successful!</h1>
      <p className="mt-4 text-gray-700">{message}</p>
    </div>
  );
}