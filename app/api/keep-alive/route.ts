import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Create a minimal Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );

    // Execute a lightweight query to keep the database alive
    const { data, error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('[Keep-Alive] Supabase query error:', error.message);
      return NextResponse.json(
        { status: 'error', message: error.message },
        { status: 500 }
      );
    }

    console.log('[Keep-Alive] Database ping successful at', new Date().toISOString());
    
    return NextResponse.json({
      status: 'ok',
      message: 'Supabase keep-alive ping successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Keep-Alive] Critical error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
