import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/app/api/v1/_lib/auth';

// GET /api/v1/auth/organizations/[orgId]/members - List members
export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const auth = await getAuthenticatedClient(request);
  if ('error' in auth) return auth.error;
  const { supabase } = auth;
  const { orgId } = await params;

  const { data: members, error } = await supabase
    .from('organization_members')
    .select('*')
    .eq('organization_id', orgId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Enrich with user profile data
  const enriched = [];
  for (const m of (members || [])) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email, avatar_url')
      .eq('id', m.user_id)
      .single();

    enriched.push({
      ...m,
      user: profile ? {
        id: m.user_id,
        email: profile.email || '',
        full_name: profile.full_name || '',
        avatar_url: profile.avatar_url || null,
      } : null,
    });
  }

  return NextResponse.json(enriched);
}

// POST /api/v1/auth/organizations/[orgId]/members - Add/invite a member
export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const auth = await getAuthenticatedClient(request);
  if ('error' in auth) return auth.error;
  const { supabase } = auth;
  const { orgId } = await params;

  const body = await request.json();

  const { data: member, error } = await supabase
    .from('organization_members')
    .insert({
      organization_id: orgId,
      user_id: body.user_id,
      role: body.role || 'member',
      status: 'active',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(member, { status: 201 });
}
