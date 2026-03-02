import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/app/api/v1/_lib/auth';

// GET /api/v1/resources/[orgId]/admin/resources - Admin: list resources for an org
export async function GET(request: Request) {
  const auth = await getAuthenticatedClient(request);
  if ('error' in auth) return auth.error;

  // Resources table doesn't exist yet — return empty array
  return NextResponse.json([]);
}
