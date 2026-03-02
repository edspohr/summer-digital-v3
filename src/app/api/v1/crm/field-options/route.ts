import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/app/api/v1/_lib/auth';

// GET /api/v1/crm/field-options - CRM field options (dropdowns, tags, etc.)
export async function GET(request: Request) {
  const auth = await getAuthenticatedClient(request);
  if ('error' in auth) return auth.error;

  // No field_options table exists yet — return empty array
  return NextResponse.json([]);
}

// POST /api/v1/crm/field-options
export async function POST(request: Request) {
  const auth = await getAuthenticatedClient(request);
  if ('error' in auth) return auth.error;

  const body = await request.json();
  // Stub: return the body with a generated id
  return NextResponse.json({ id: crypto.randomUUID(), ...body, is_active: true });
}
