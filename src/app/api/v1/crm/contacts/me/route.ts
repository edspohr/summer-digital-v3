import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/app/api/v1/_lib/auth';

// GET /api/v1/crm/contacts/me - Current user's CRM contact profile
export async function GET(request: Request) {
  const auth = await getAuthenticatedClient(request);
  if ('error' in auth) return auth.error;
  const { supabase, user } = auth;

  // Build a contact-like response from the profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const contact = {
    id: user.id,
    user_id: user.id,
    email: user.email || '',
    full_name: profile?.full_name || user.user_metadata?.full_name || '',
    avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || null,
    phone: profile?.phone || null,
    city: profile?.city || null,
    country: profile?.country || null,
    bio: profile?.bio || null,
    tags: [],
    custom_fields: {},
    created_at: profile?.created_at || user.created_at,
    updated_at: profile?.updated_at || null,
  };

  return NextResponse.json(contact);
}

// PATCH /api/v1/crm/contacts/me - Update current user's contact profile
export async function PATCH(request: Request) {
  const auth = await getAuthenticatedClient(request);
  if ('error' in auth) return auth.error;
  const { supabase, user } = auth;

  const body = await request.json();

  const { data: updated, error } = await supabase
    .from('profiles')
    .update(body)
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(updated);
}
