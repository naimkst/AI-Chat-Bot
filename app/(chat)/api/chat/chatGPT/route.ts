import OpenAI from 'openai';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma'; // Make sure this path is correct

const openai = new OpenAI();

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    const userId = '1';

    const chat = await prisma.chat.create({
      data: {
        model: 'gpt-4.1-mini',
        createdAt: new Date(),
        conversation: {
          create: {
            user: {
              connect: { id: userId }, // make sure `userId` is available
            },
            messages: {
              create: [
                {
                  role: 'user',
                  content: 'test',
                },
              ],
            },
          },
        },
      },
      include: {
        conversation: {
          include: {
            messages: true,
          },
        },
      },
    });

    // Generate streaming response from OpenAI
    const completion: any = await openai.chat.completions.create({
      ...message,
      stream: true,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of completion) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`),
          );
        }

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
      },
    );
  }
}
