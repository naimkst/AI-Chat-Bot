// app/api/conversation/route.ts (DELETE handler)
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json(); // expects conversationId in body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing conversation ID' },
        { status: 400 }
      );
    }

    // Delete all related messages and chats first (to avoid FK constraint)
    await prisma.message.deleteMany({ where: { conversationId: id } });
    await prisma.chat.deleteMany({ where: { conversationId: id } });

    // Then delete the conversation
    await prisma.conversation.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Conversation deleted successfully',
    });
  } catch (error) {
    console.error('[DELETE_CONVERSATION]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete conversation' },
      { status: 500 }
    );
  }
}