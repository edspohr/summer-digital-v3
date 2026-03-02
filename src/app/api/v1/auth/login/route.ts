import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { ApiLoginResponse, ApiUser } from '@/types/api.types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user || !data.session) {
      return NextResponse.json({ error: error?.message || 'Login failed' }, { status: 401 });
    }

    // Try to parse full name if available in metadata
    const fullName = data.user.user_metadata?.full_name || '';

    const apiUser: ApiUser = {
      id: data.user.id,
      email: data.user.email || email,
      full_name: fullName,
      avatar_url: data.user.user_metadata?.avatar_url || null,
      is_platform_admin: false, // You might need a way to check this via DB
      status: 'active',
      organizations: [], // Fetch orgs here if needed
    };

    const response: ApiLoginResponse = {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      token_type: data.session.token_type,
      user: apiUser,
    };

    return NextResponse.json(response);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
