import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }

  const record = await prisma.emailVerificationToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!record) {
    return NextResponse.json({ error: 'Token not found or already used' }, { status: 404 });
  }

  if (record.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Token expired' }, { status: 410 });
  }

  // Mark user as verified
  await prisma.user.update({
    where: { id: record.userId },
    data: { emailVerified: true },
  });

  // Delete token so it can't be reused
  await prisma.emailVerificationToken.delete({
    where: { token },
  });

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`);
}