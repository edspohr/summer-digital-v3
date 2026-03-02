import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/app/api/v1/_lib/auth';

// GET /api/v1/auth/organizations - List organizations the user belongs to
export async function GET(request: Request) {
  const auth = await getAuthenticatedClient(request);
  if ('error' in auth) return auth.error;
  const { supabase, user } = auth;

  // Get user's org memberships
  const { data: memberships, error: memErr } = await supabase
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', user.id);

  if (memErr) {
    return NextResponse.json({ error: memErr.message }, { status: 500 });
  }

  if (!memberships || memberships.length === 0) {
    return NextResponse.json([]);
  }

  // Fetch the actual org details
  const orgIds = memberships.map((m: { organization_id: string }) => m.organization_id);
  const { data: orgs, error: orgErr } = await supabase
    .from('organizations')
    .select('*')
    .in('id', orgIds);

  if (orgErr) {
    return NextResponse.json({ error: orgErr.message }, { status: 500 });
  }

  return NextResponse.json(orgs || []);
}

// POST /api/v1/auth/organizations - Create a new organization
export async function POST(request: Request) {
  const auth = await getAuthenticatedClient(request);
  if ('error' in auth) return auth.error;
  const { supabase, user } = auth;

  const body = await request.json();

  const { data: org, error } = await supabase
    .from('organizations')
    .insert({
      name: body.name,
      slug: body.slug,
      description: body.description || null,
      logo_url: body.logo_url || null,
      type: body.type || 'standard',
      settings: body.settings || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Add creator as admin member
  await supabase.from('organization_members').insert({
    organization_id: org.id,
    user_id: body.owner_user_id || user.id,
    role: 'admin',
    status: 'active',
  });

  return NextResponse.json(org, { status: 201 });
}
