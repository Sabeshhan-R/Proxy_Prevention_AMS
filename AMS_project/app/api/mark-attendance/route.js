import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/attendance/scan
 *
 * Called by the Mobile App after scanning a student's QR code.
 * Body:
 * {
 *   student_id: UUID,    ← from QR payload
 *   session_id: UUID,    ← from QR payload
 *   token: string,       ← from QR payload
 *   device_id: string    ← mobile app's unique device identifier
 * }
 *
 * Validation Chain (in order):
 * 1. Input presence check
 * 2. Session exists, is active, not expired
 * 3. Student exists
 * 4. Device ID matches student's registered device
 * 5. Atomic token claim:  UPDATE qr_token SET used=true WHERE token=? AND used=false AND expires_at > now RETURNING *
 *    → If nothing returned → token invalid / expired / already used
 * 6. Duplicate attendance check (handled by DB UNIQUE constraint)
 * 7. Insert attendance record
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { student_id, session_id, token, device_id } = body;

    // ── 1. Input validation ──────────────────────────────────────────────────
    if (!student_id || !session_id || !token || !device_id) {
      return NextResponse.json(
        { error: 'student_id, session_id, token, and device_id are all required' },
        { status: 400 }
      );
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(student_id) || !uuidRegex.test(session_id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    // Token should be alphanumeric only (prevents injection)
    if (!/^[a-zA-Z0-9_-]{8,20}$/.test(token)) {
      return NextResponse.json({ error: 'Invalid token format' }, { status: 400 });
    }

    const now = new Date().toISOString();

    // ── 2. Validate session ──────────────────────────────────────────────────
    const { data: session, error: sessionError } = await supabase
      .from('session')
      .select('session_id, is_active, expires_at')
      .eq('session_id', session_id)
      .maybeSingle();

    if (sessionError) throw sessionError;
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    if (!session.is_active || now >= session.expires_at) {
      return NextResponse.json({ error: 'Attendance session has expired or is not active' }, { status: 403 });
    }

    // ── 3 & 4. Validate student + device binding ─────────────────────────────
    const { data: student, error: studentError } = await supabase
      .from('student')
      .select('student_id, device_id, is_active')
      .eq('student_id', student_id)
      .maybeSingle();

    if (studentError) throw studentError;
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    if (!student.is_active) {
      return NextResponse.json({ error: 'Student account is inactive' }, { status: 403 });
    }

    // Device binding check
    // If student has NO registered device yet, bind this device (first scan)
    if (!student.device_id) {
      const { error: bindError } = await supabase
        .from('student')
        .update({ device_id })
        .eq('student_id', student_id);

      if (bindError) throw bindError;
      console.log(`[Device Bind] student=${student_id} bound to device=${device_id}`);
    } else if (student.device_id !== device_id) {
      console.warn(`[Device Mismatch] student=${student_id} registered=${student.device_id} scanned=${device_id}`);
      return NextResponse.json(
        { error: 'Device mismatch. Only your registered device can mark attendance.' },
        { status: 401 }
      );
    }

    // ── 5. Atomic token claim — CRITICAL CONCURRENCY PROTECTION ─────────────
    // We atomically UPDATE the token to used=true ONLY IF:
    //   - token string matches
    //   - student_id matches (prevents using another student's token)
    //   - session_id matches
    //   - used is currently false (prevents replay attacks)
    //   - not yet expired
    //
    // Because this is a single atomic UPDATE + RETURNING, two simultaneous
    // scans will race, but only one will get back a row. The other gets null.
    const { data: claimedToken, error: tokenError } = await supabase
      .from('qr_token')
      .update({ used: true })
      .match({ student_id, session_id, token, used: false })
      .gt('expires_at', now)
      .select('token_id')
      .maybeSingle();

    if (tokenError) throw tokenError;

    if (!claimedToken) {
      return NextResponse.json(
        { error: 'QR token is invalid, expired, or has already been used' },
        { status: 403 }
      );
    }

    // ── 6 & 7. Mark attendance ───────────────────────────────────────────────
    // DB UNIQUE constraint on (student_id, session_id) handles duplicate prevention
    const { data: attendance, error: attendanceError } = await supabase
      .from('attendance')
      .insert({
        student_id,
        session_id,
        status: 'Present',
        marked_at: now,
        device_info: `device:${device_id}`,
      })
      .select('attendance_id, marked_at')
      .single();

    if (attendanceError) {
      // If duplicate error (code 23505), attendance was already marked
      if (attendanceError.code === '23505') {
        return NextResponse.json(
          { error: 'Attendance already marked for this session' },
          { status: 409 }
        );
      }

      // On any other insert failure, roll-back the token claim so student can retry
      await supabase
        .from('qr_token')
        .update({ used: false })
        .eq('token_id', claimedToken.token_id);

      throw attendanceError;
    }

    console.log(`[Attendance Marked] student=${student_id} session=${session_id} at=${attendance.marked_at}`);

    return NextResponse.json({
      success: true,
      message: 'Attendance recorded successfully',
      attendance_id: attendance.attendance_id,
      marked_at: attendance.marked_at,
    });

  } catch (error) {
    console.error('[Attendance Scan Error]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
