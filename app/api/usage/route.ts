// /app/api/usage/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Missing userId' }), { status: 400 });
  }

  const usage = await prisma.userSubscriptionUsage.findUnique({ where: { userId } });

  return new Response(JSON.stringify({
    messageCount: usage?.messageCount || 0,
  }), { status: 200 });
}