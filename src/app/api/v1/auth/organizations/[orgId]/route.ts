import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/app/api/v1/_lib/auth';

// GET /api/v1/auth/organizations/[orgId] - Get a specific organization
export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const auth = await getAuthenticatedClient(request);
  if ('error' in auth) return auth.error;
  const { supabase } = auth;
  const { orgId } = await params;

  const { data: org, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', orgId)
    .single();

  if (error || !org) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
  }

  return NextResponse.json(org);
}

// PATCH /api/v1/auth/organizations/[orgId] - Update an organization
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const auth = await getAuthenticatedClient(request);
  if ('error' in auth) return auth.error;
  const { supabase } = auth;
  const { orgId } = await params;

  const body = await request.json();

  const { data: updated, error } = await supabase
    .from('organizations')
    .update(body)
    .eq('id', orgId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(updated);
}

// DELETE /api/v1/auth/organizations/[orgId] - Delete an organization
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const auth = await getAuthenticatedClient(request);
  if ('error' in auth) return auth.error;
  const { supabase } = auth;
  const { orgId } = await params;

  const { error } = await supabase
    .from('organizations')
    .delete()
    .eq('id', orgId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
