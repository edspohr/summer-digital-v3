import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { ApiUserPointsSummary } from '@/types/api.types';

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

    // Attempt to fetch from real gamification tables if they exist
    // If they don't, we gracefully fallback to 0 points
    const { data: ledger } = await supabase
      .from('points_ledger')
      .select('amount')
      .eq('user_id', user.id);
      
    const totalPoints = ledger?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

    const summary: ApiUserPointsSummary = {
      total_points: totalPoints,
      current_level: null,
      next_level: null,
      points_to_next_level: 100,
      rewards: [],
      recent_activities: []
    };

    return NextResponse.json(summary);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
