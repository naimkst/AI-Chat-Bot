import OpenAI from 'openai';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

const openai = new OpenAI();

export async function POST(req: NextRequest) {
  try {
    const { message, userId, id: conversationIdFromBody } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing userId' }), { status: 400 });
    }

    const userMessageParts = message?.messages?.[0]?.content || [];
    const hasText = userMessageParts.some((part: any) => part.type === 'text');
    const userMessageText = hasText
      ? userMessageParts.find((part: any) => part.type === 'text')?.text
      : '';

    let conversationId = conversationIdFromBody;

    // ✅ If no conversationId, create a new one
    if (!conversationId) {
      const conversation = await prisma.conversation.create({
        data: {
          user: {
            connect: { id: userId },
          },
        },
      });

      conversationId = conversation.id;
    }

    // ✅ Always create a new Chat
    const chat = await prisma.chat.create({
      data: {
        model: 'gpt-4o',
        conversationId,
      },
    });

    // ✅ Save full user message parts (JSON.stringify)
    await prisma.message.create({
      data: {
        role: 'user',
        content: JSON.stringify(userMessageParts), // 👈 store as JSON string
        chatId: chat.id,
        conversationId,
      },
    });

    // ✅ Call OpenAI with stream
    const completion: any = await openai.chat.completions.create({
      ...message,
      stream: true,
      model: 'gpt-4o',
      temperature: 1.4,
      max_tokens: 5000,
      top_p: 1.0,
      // top_k: 100,
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

        // ✅ Save assistant response (you could also wrap it in parts array)
        if (assistantReply) {
          await prisma.message.create({
            data: {
              role: 'assistant',
              content: JSON.stringify([
                {
                  type: 'text',
                  text: assistantReply,
                },
              ]),
              chatId: chat.id,
              conversationId,
            },
          });
        }

        // ✅ Send final message with conversationId
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              done: true,
              conversationId,
            })}\n\n`
          )
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
    return new Response(
      JSON.stringify({ error: err?.message || 'Server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}