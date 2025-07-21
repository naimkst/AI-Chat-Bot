import { prisma } from './prisma';

export async function getMessageCountByUserId({
  id: userId,
  differenceInHours,
}: {
  id: string;
  differenceInHours: number;
}): Promise<number> {
  const now = new Date();
  const timeAgo = new Date(now.getTime() - differenceInHours * 60 * 60 * 1000);

  const usage = await prisma.userSubscriptionUsage.findUnique({
    where: { userId },
  });

  // If no usage record exists, return 0
  if (!usage) {
    return 0;
  }

  // If the last reset was before our time window or never reset, reset the count
  if (!usage.lastResetAt || usage.lastResetAt < timeAgo) {
    await prisma.userSubscriptionUsage.update({
      where: { userId },
      data: {
        messageCount: 0,
        lastResetAt: now,
      },
    });
    return 0;
  }

  return usage.messageCount;
}
