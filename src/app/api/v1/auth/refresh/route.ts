import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Token refresh is handled client-side by Supabase SDK.
  // This stub prevents the frontend from getting a 404.
  try {
    const body = await request.json().catch(() => ({}));
    // Return a minimal token-like response so the client doesn't crash
    return NextResponse.json({
      access_token: body.refresh_token || '',
      refresh_token: body.refresh_token || '',
      token_type: 'bearer',
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
