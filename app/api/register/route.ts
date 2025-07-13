import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/sendVerificationEmail';
import { v4 as uuidv4 } from 'uuid';
import { addHours } from 'date-fns';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const hashedPassword = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    const verificationToken = uuidv4();

    // Store token in DB with 1-hour expiry
    await prisma.emailVerificationToken.create({
      data: {
        email,
        userId: user.id,
        token: verificationToken,
        expiresAt: addHours(new Date(), 1),
      },
    });

    try {
      await sendVerificationEmail(email, String(verificationToken));
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return NextResponse.json({ error: 'Email sending failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}