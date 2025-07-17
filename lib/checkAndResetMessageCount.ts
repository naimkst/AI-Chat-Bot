import { prisma } from './prisma';

export async function checkAndResetMessageCount(userId: string) {
  const subscription = await prisma.userSubscription.findUnique({
    where: { userId },
  });

  if (!subscription || subscription.planAmount === 0) return;

  const usage = await prisma.userSubscriptionUsage.findUnique({
    where: { userId },
  });

  const now = new Date();
  const periodEnd = new Date(subscription.currentPeriodEnd || '');

  if (periodEnd < now && usage) {
    await prisma.userSubscriptionUsage.update({
      where: { userId },
      data: {
        messageCount: 0,
      },
    });

    await prisma.userSubscription.update({
      where: { userId },
      data: {
        currentPeriodEnd: new Date(new Date().setMonth(now.getMonth() + 1)),
      },
    });
  }
}