// utils/trackMessageUsage.ts

import { prisma } from '@/lib/prisma';

export async function trackMessageUsage(userId: string): Promise<boolean> {
  const usage = await prisma.userSubscriptionUsage.upsert({
    where: { userId },
    create: { userId, messageCount: 1 },
    update: { messageCount: { increment: 1 } },
  });

  const subscription = await prisma.userSubscription.findUnique({
    where: { userId },
  });

  const limit = subscription?.planAmount === 1000
    ? 100
    : subscription?.planAmount === 2000
      ? 200
      : 5; // Free plan

  return usage.messageCount <= limit;
}