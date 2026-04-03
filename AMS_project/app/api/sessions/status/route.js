import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/sessions/status?lab_id=LAB-01
 *
 * Returns the current active session for a lab, or { active: false }.
 * Used by student clients to poll for new sessions every 5 seconds.
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const lab_id = searchParams.get('lab_id');

    if (!lab_id) {
      return NextResponse.json({ error: 'lab_id query param is required' }, { status: 400 });
    }

    const now = new Date().toISOString();

    const { data: session, error } = await supabase
      .from('session')
      .select(`
        session_id,
        lab_id,
        expires_at,
        is_active,
        teacher:teacher_id ( name, email )
      `)
      .eq('lab_id', lab_id)
      .eq('is_active', true)
      .gt('expires_at', now)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (!session) {
      return NextResponse.json({ active: false });
    }

    return NextResponse.json({
      active: true,
      session_id: session.session_id,
      lab_id: session.lab_id,
      expires_at: session.expires_at,
      teacher_name: session.teacher?.name,
    });

  } catch (error) {
    console.error('[Session Status Error]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/sessions/status  (alias for ending a session)
 * Body: { session_id }
 */
export async function POST(req) {
  try {
    const { session_id } = await req.json();
    if (!session_id) {
      return NextResponse.json({ error: 'session_id required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('session')
      .update({ is_active: false })
      .eq('session_id', session_id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Session ended' });
  } catch (error) {
    console.error('[Session End Error]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
