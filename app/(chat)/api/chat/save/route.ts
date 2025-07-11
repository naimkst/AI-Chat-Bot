// /api/chat/save.ts

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: any) {
  try {
    const { userId, chatId, messages } = await req.json();

    // Create or find the Chat
    const chat = await prisma.chat.upsert({
      where: { id: chatId },
      update: {},
      create: {
        id: chatId,
        userId,
      },
    });

    // Save each message
    const messageInserts = messages.map((msg: any) =>
      prisma.chatMessage.create({
        data: {
          chatId: chat.id,
          role: msg.role,
          text: msg.text || null,
          imageUrl: msg.imageUrl || null,
        },
      }),
    );

    await Promise.all(messageInserts);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to save messages' },
      { status: 500 },
    );
  }
}
