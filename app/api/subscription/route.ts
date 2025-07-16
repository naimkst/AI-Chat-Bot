// app/api/subscription/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('user_id');

  if (!userId) {
    return new Response(JSON.stringify({ error: 'Missing user_id' }), { status: 400 });
  }

  try {
    const subscription = await prisma.userSubscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      return new Response(JSON.stringify({ error: 'No active subscription' }), { status: 404 });
    }

    return new Response(JSON.stringify({ subscription }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}