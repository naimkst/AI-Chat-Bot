import OpenAI from 'openai';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAndResetMessageCount } from '@/lib/checkAndResetMessageCount';

const openai = new OpenAI();

export async function POST(req: NextRequest) {
  try {
    const { message, userId, id: conversationIdFromBody } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing userId' }), { status: 400 });
    }


    // Check subscription and usage
    const subscription = await prisma.userSubscription.findUnique({ where: { userId } });
    const usage = await prisma.userSubscriptionUsage.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Strip time

    const expiryDate = new Date(subscription?.currentPeriodEnd || '');
    expiryDate.setHours(0, 0, 0, 0); // Strip time

    const isExpired = expiryDate < today;

    console.log('isExpired======================', isExpired)
    console.log('expiryDate======================', expiryDate)
    console.log('today======================', today)
    
   if (isExpired) {
      return new Response(JSON.stringify({
          error: 'Your subscription has expired. Please renew your subscription.',
        }), {
          status: 403,
        });
    }

    if(!subscription){
      // Create a free plan
      const subscription = await prisma.userSubscription.create({
        data: {
          userId,
          stripeSubscriptionId: '',
          stripeCustomerId: '',
          planAmount: 0,
          status: 'active',
          interval: 'month',
        },
      });
    }


      const getUser: any = await prisma.user.findUnique({
        where: { id: userId },
        include: {
        UserSubscription: true,
        usage: true,
      },
    });

    if (
      getUser.UserSubscription?.[0]?.planAmount === 0 &&
      getUser.usage?.messageCount >= 5
    ) {
      return new Response(JSON.stringify({
          error: 'You have reached your 5-message limit. Please upgrade your plan.',
        }), {
          status: 403,
        });
    }
    if (
      getUser.UserSubscription?.[0]?.planAmount === 1000 &&
      getUser.usage?.messageCount >= 100
    ) {
      return new Response(JSON.stringify({
          error: 'You have reached your 100-message limit. Please upgrade your plan.',
        }), {
          status: 403,
        });
    }

     if (
      getUser.UserSubscription?.[0]?.planAmount === 2000 &&
      getUser.usage?.messageCount >= 200
    ) {
      return new Response(JSON.stringify({
          error: 'You have reached your 200-message limit. Please upgrade your plan.',
        }), {
          status: 403,
        });
    }

    // Create conversation if not exists
    let conversationId = conversationIdFromBody;
    if (!conversationId) {
      const conversation = await prisma.conversation.create({
        data: {
          user: { connect: { id: userId } },
        },
      });
      conversationId = conversation.id;
    }

    // Create chat
    const chat = await prisma.chat.create({
      data: {
        model: 'gpt-4o',
        conversationId,
      },
    });

    // Save user message
    const userMessageParts = message?.messages?.[0]?.content || [];
    await prisma.message.create({
      data: {
        role: 'user',
        content: JSON.stringify(userMessageParts),
        chatId: chat.id,
        conversationId,
      },
    });

    // Increment message count
    await prisma.userSubscriptionUsage.update({
      where: { userId },
      data: { messageCount: { increment: 1 } },
    });

    // OpenAI response
    const completion: any = await openai.chat.completions.create({
      ...message,
      stream: true,
      model: 'gpt-4o',
      // temperature: 1.4,
      // max_tokens: 5000,
    });

    const encoder = new TextEncoder();
    let assistantReply = '';

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of completion) {
          const content = chunk?.choices?.[0]?.delta?.content;
          if (content) {
            assistantReply += content;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
          }
        }

        if (assistantReply) {
          await prisma.message.create({
            data: {
              role: 'assistant',
              content: JSON.stringify([{ type: 'text', text: assistantReply }]),
              chatId: chat.id,
              conversationId,
            },
          });
        }

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ done: true, conversationId })}\n\n`)
        );
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err: any) {
    console.error('API Error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}