import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/app/api/v1/_lib/auth';

// GET /api/v1/crm/stats - CRM dashboard statistics
export async function GET(request: Request) {
  const auth = await getAuthenticatedClient(request);
  if ('error' in auth) return auth.error;
  const { supabase } = auth;

  // Count total users from organization_members
  const { count: totalMembers } = await supabase
    .from('organization_members')
    .select('*', { count: 'exact', head: true });

  return NextResponse.json({
    total_contacts: totalMembers || 0,
    active_contacts: totalMembers || 0,
    inactive_contacts: 0,
    new_contacts_this_month: 0,
    total_tasks: 0,
    pending_tasks: 0,
    completed_tasks: 0,
    overdue_tasks: 0,
  });
}
