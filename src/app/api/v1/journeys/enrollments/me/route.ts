import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/app/api/v1/_lib/auth';

// GET /api/v1/journeys/enrollments/me - User's journey enrollments
export async function GET(request: Request) {
  const auth = await getAuthenticatedClient(request);
  if ('error' in auth) return auth.error;

  // Enrollments table doesn't exist yet — return empty array
  return NextResponse.json([]);
}
