import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/app/api/v1/_lib/auth';

// GET /api/v1/journeys/me/onboarding-check
export async function GET(request: Request) {
  const auth = await getAuthenticatedClient(request);
  if ('error' in auth) return auth.error;

  // No journeys exist yet, skip onboarding
  return NextResponse.json({ should_show: false, journey_id: null });
}
