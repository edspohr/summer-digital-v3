import { NextResponse } from 'next/server';

export async function POST() {
  // Supabase sessions are managed client-side; this endpoint
  // just acknowledges the logout request.
  return new NextResponse(null, { status: 204 });
}
