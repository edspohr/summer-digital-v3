import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { ApiUser } from '@/types/api.types';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Create an authenticated client to query tables while respecting RLS
    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );
    
    // Validate token and get user securely from Supabase
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Optionally fetch more data from a 'profiles' table if it exists
    const { data: profile, error: profileError } = await supabaseAuth
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error("Profile Fetch Error:", profileError);
    }

    const fullName = profile?.full_name || user.user_metadata?.full_name || '';
    const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || null;

    // Bootstrap first superadmins (Supabase DB might not have them as admins yet)
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
      organizations: [], // Could fetch auth mapped to user roles
    };

    return NextResponse.json(apiUser);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
