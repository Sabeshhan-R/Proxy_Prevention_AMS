import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/sessions/start
 * Body: { teacher_id, lab_id, expires_in_minutes? }
 *
 * 1. Verify teacher exists and is active
 * 2. Deactivate any running sessions in this lab (only one active per lab)
 * 3. Create a new session row
 * Returns: { session_id, expires_at }
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { teacher_id, lab_id, expires_in_minutes = 2 } = body;

    // ── Validation ──────────────────────────────────────────────────────────
    if (!teacher_id || !lab_id) {
      return NextResponse.json(
        { error: 'teacher_id and lab_id are required' },
        { status: 400 }
      );
    }

    // Verify the teacher actually exists and is active
    const { data: teacher, error: teacherError } = await supabase
      .from('teacher')
      .select('teacher_id, is_active')
      .eq('teacher_id', teacher_id)
      .maybeSingle();

    if (teacherError) throw teacherError;
    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }
    if (!teacher.is_active) {
      return NextResponse.json({ error: 'Teacher account is inactive' }, { status: 403 });
    }

    // ── Deactivate existing sessions for this lab ───────────────────────────
    const { error: deactivateError } = await supabase
      .from('session')
      .update({ is_active: false })
      .match({ lab_id, is_active: true });

    if (deactivateError) throw deactivateError;

    // ── Create new session ──────────────────────────────────────────────────
    const expiresAt = new Date(Date.now() + expires_in_minutes * 60 * 1000).toISOString();

    const { data: session, error: sessionError } = await supabase
      .from('session')
      .insert({
        teacher_id,
        lab_id,
        expires_at: expiresAt,
        is_active: true,
      })
      .select('session_id, expires_at, lab_id')
      .single();

    if (sessionError) throw sessionError;

    console.log(`[Session Start] teacher=${teacher_id} lab=${lab_id} session=${session.session_id}`);

    return NextResponse.json({
      success: true,
      session_id: session.session_id,
      expires_at: session.expires_at,
      lab_id: session.lab_id,
    });

  } catch (error) {
    console.error('[Session Start Error]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
