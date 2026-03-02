import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/app/api/v1/_lib/auth';
import type { ApiUser } from '@/types/api.types';

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedClient(request);
    if ('error' in auth) return auth.error;
    const { supabase, user } = auth;

    // Fetch profile from the real profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Fetch organization memberships
    const { data: memberships } = await supabase
      .from('organization_members')
      .select('id, organization_id, role, status, joined_at')
      .eq('user_id', user.id);

    // For each membership, get the organization name
    const organizations = [];
    if (memberships) {
      for (const m of memberships) {
        const { data: org } = await supabase
          .from('organizations')
          .select('name, slug')
          .eq('id', m.organization_id)
          .single();

        organizations.push({
          id: m.id,
          organization_id: m.organization_id,
          role: m.role || 'member',
          status: m.status || 'active',
          joined_at: m.joined_at || null,
          organization_name: org?.name || null,
          organization_slug: org?.slug || null,
        });
      }
    }

    const fullName = profile?.full_name || user.user_metadata?.full_name || '';
    const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || null;

    // Bootstrap superadmin
    let isPlatformAdmin = profile?.is_platform_admin || false;
    if (user.email === 'edmundo@spohr.cl') {
      isPlatformAdmin = true;
    }

    const apiUser: ApiUser = {
      id: user.id,
      email: user.email || '',
      full_name: fullName,
      avatar_url: avatarUrl,
      is_platform_admin: isPlatformAdmin,
      status: 'active',
      organizations,
    };

    return NextResponse.json(apiUser);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
