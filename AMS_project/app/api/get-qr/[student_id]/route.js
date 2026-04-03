import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

/**
 * GET /api/get-qr/:student_id?session_id=...
 * Simple getter for the current QR token of a student.
 * Validates lab network to prevent remote access.
 */
export async function GET(req, { params }) {
  try {
    const { student_id } = params;
    const url = new URL(req.url);
    const session_id = url.searchParams.get('session_id');

    if (!student_id || !session_id) {
      return NextResponse.json({ error: 'student_id and session_id are required' }, { status: 400 });
    }

    // ── 0. Lab Network Verification ──────────────────────────────────────────
    const forwarded = req.headers.get('x-forwarded-for');
    const remoteIp = forwarded ? forwarded.split(',')[0] : 'unknown';
    const isLocalhost = remoteIp === '::1' || remoteIp === '127.0.0.1' || remoteIp === '::ffff:127.0.0.1';
    const LAB_PUBLIC_IP = process.env.LAB_STATIC_IP || 'unknown'; 
    const isInLabNetwork = isLocalhost || (remoteIp === LAB_PUBLIC_IP) || (process.env.ALLOW_ALL_IPS === 'true');

    if (!isInLabNetwork) {
      return NextResponse.json({ 
        error: 'Unauthorized Network. QR codes are only accessible from Lab PCs.',
        ip: remoteIp 
      }, { status: 403 });
    }

    // ── 1. Fetch token from DB ───────────────────────────────────────────────
    const now = new Date().toISOString();
    const { data: tokenRecord, error } = await supabase
      .from('qr_token')
      .select('token, expires_at, used')
      .eq('student_id', student_id)
      .eq('session_id', session_id)
      .gt('expires_at', now)
      .eq('used', false)
      .maybeSingle();

    if (error) throw error;

    if (!tokenRecord) {
      return NextResponse.json({ error: 'No active token found for this student/session. Generate one first.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      token: tokenRecord.token,
      expires_at: tokenRecord.expires_at,
    });

  } catch (err) {
    console.error('[GET QR Error]', err.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
