// /app/api/conversation-history/route.ts

import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body; // conversation ID

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'asc' },
      include: {
        chat: {
          select: {
            id: true,
            model: true,
          },
        },
        conversation: {
          select: {
            id: true,
            userId: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: messages });
  } catch (err) {
    console.error('Fetch Error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
}