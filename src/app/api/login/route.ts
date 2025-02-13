// app/api/login/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { username, password } = body;

  // Do whatever logic you want here (e.g. authenticate user)
  console.log('Username:', username);
  console.log('Password:', password);

  return NextResponse.json({ success: true });
}
