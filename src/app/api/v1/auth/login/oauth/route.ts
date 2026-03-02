import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider');
    const redirectTo = searchParams.get('redirect_to');

    if (!provider || provider !== 'google') {
      return NextResponse.json({ error: 'Invalid or missing provider' }, { status: 400 });
    }

    if (!redirectTo) {
      return NextResponse.json({ error: 'Missing redirect_to' }, { status: 400 });
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // data.url contains the OAuth provider URL
    return NextResponse.json({ url: data.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
