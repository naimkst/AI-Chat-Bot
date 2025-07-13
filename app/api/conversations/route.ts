import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// pages/api/conversations/route.ts
export async function GET(req: any) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ success: false, error: "Missing userId" }, { status: 400 });
  }

  try {
    const conversations = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }, // ✅ get full chat in order
        },
      },
    });

    return NextResponse.json({ success: true, data: conversations });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}