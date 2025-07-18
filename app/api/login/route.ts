import { prisma } from '@/lib/prisma';
import { sign } from 'jsonwebtoken';
import { compare } from 'bcryptjs'; // or 'bcrypt'
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // ✅ Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // ✅ Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // ✅ Compare password using bcrypt
    const isMatch = await compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // ✅ Generate JWT token
    const token = sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: '1d',
    });

    // ✅ Return response with HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}