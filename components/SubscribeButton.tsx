'use client';
import { useState } from 'react';

export default function SubscribeButton() {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/create-checkout-session', { method: 'POST' });

      const text = await res.text();
      const data = JSON.parse(text);

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data?.error || 'Failed to create session');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSubscribe}
      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
      disabled={loading}
    >
      {loading ? 'Redirecting...' : 'Subscribe Now'}
    </button>
  );
}