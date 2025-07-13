import { prisma } from '@/lib/prisma';
import { sign } from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { email, password } = await req.json();

  // Verify user manually from DB...
  const user = await prisma.user.findUnique({ where: { email } });
  // Compare password etc...

  const token = sign({ userId: user?.id }, process.env.JWT_SECRET!, {
    expiresIn: '1d',
  });

  const response = NextResponse.json({ success: true });

  response.cookies.set('token', token, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24, // 1 day
  });

  return response;
}