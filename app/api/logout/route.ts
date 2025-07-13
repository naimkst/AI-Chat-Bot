import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out' });

  // Clear the token cookie by setting it to expired
  response.cookies.set('token', '', {
    httpOnly: true,
    expires: new Date(0), // Expire immediately
    path: '/',
  });

  return response;
}