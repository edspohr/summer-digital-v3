import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/app/api/v1/_lib/auth';

export async function GET(request: Request) {
  const auth = await getAuthenticatedClient(request);
  if ('error' in auth) return auth.error;
  const { supabase, user } = auth;

  // Query organization_members to get user's orgs
  const { data: memberships } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id);

  const orgIds = (memberships || []).map((m: { organization_id: string }) => m.organization_id);

  // For each org, list members from profiles
  const allUsers: Record<string, unknown>[] = [];
  for (const orgId of orgIds) {
    const { data: members } = await supabase
      .from('organization_members')
      .select('user_id, role, status, joined_at')
      .eq('organization_id', orgId);

    if (members) {
      for (const member of members) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', member.user_id)
          .single();

        if (profile) {
          allUsers.push({
            id: profile.id,
            email: profile.email || '',
            full_name: profile.full_name || '',
            avatar_url: profile.avatar_url || null,
            is_platform_admin: profile.is_platform_admin || false,
            status: profile.status || 'active',
            organizations: [{
              id: orgId,
              organization_id: orgId,
              role: member.role || 'member',
              status: member.status || 'active',
              joined_at: member.joined_at,
            }],
          });
        }
      }
    }
  }

  // Deduplicate by id
  const seen = new Set<string>();
  const unique = allUsers.filter((u) => {
    const id = u.id as string;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  return NextResponse.json({ users: unique, count: unique.length });
}
