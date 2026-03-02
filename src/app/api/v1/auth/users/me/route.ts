import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { ApiUser } from '@/types/api.types';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Validate token and get user securely from Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Optionally fetch more data from a 'profiles' table if it exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const fullName = profile?.full_name || user.user_metadata?.full_name || '';
    const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || null;

    const apiUser: ApiUser = {
      id: user.id,
      email: user.email || '',
      full_name: fullName,
      avatar_url: avatarUrl,
      is_platform_admin: profile?.is_platform_admin || false,
      status: 'active',
      organizations: [], // Could fetch auth mapped to user roles
    };

    return NextResponse.json(apiUser);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
