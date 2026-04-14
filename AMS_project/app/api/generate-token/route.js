import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { nanoid } from 'nanoid';

/**
 * POST /api/qr/token
 * Body: { student_id (UUID), session_id (UUID) }
 *
 * Core token generation logic:
 * 1. Validate session is active and not expired
 * 2. Validate student exists
 * 3. UPSERT token — UPDATE if exists, INSERT if new
 *    (only one token row per student per session, enforced by DB UNIQUE constraint)
 * 4. Return { token, expires_at }
 *
 * Token lifetime: 30 seconds (alphanumeric, 12 chars)
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { student_id, session_id } = body;

    // ── 0. Lab Network Verification ──────────────────────────────────────────
    // Only the website (lab PCs) should be able to generate QR tokens.
    // The mobile app (scanning) does NOT need to be on the lab network.
    const forwarded = req.headers.get('x-forwarded-for');
    const remoteIp = forwarded ? forwarded.split(',')[0] : 'unknown';

    // Define Allowed Lab Networks (Update these to match the real lab environment)
    // For local development, we allow localhost/loopback.
    const isLocalhost = remoteIp === '::1' || remoteIp === '127.0.0.1' || remoteIp === '::ffff:127.0.0.1';
    
    // In a real lab, this would be a specific static IP or a CIDR range.
    // E.g., if the Lab PCs always have public IP 203.0.113.5:
    const LAB_PUBLIC_IP = process.env.LAB_STATIC_IP || 'unknown'; 
    const isInLabNetwork = isLocalhost || (remoteIp === LAB_PUBLIC_IP);


    const ALLOW_ALL_IPS = process.env.ALLOW_ALL_IPS === 'true';

    if (!isInLabNetwork && !ALLOW_ALL_IPS) {
      return NextResponse.json({
        error: 'Unauthorized Network. You must be on the Lab PC network to access attendance.',
        client_ip: remoteIp
      }, { status: 403 });
    }

    // ── 1. Input validation ──────────────────────────────────────────────────
    if (!student_id || !session_id) {
      return NextResponse.json(
        { error: 'student_id and session_id are required' },
        { status: 400 }
      );
    }

    // UUID format check
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(student_id) || !uuidRegex.test(session_id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const now = new Date();


    // ── Validate session — let the DB do the time comparison ─────────────────
    // Using .gt('expires_at', now.toISOString()) means PostgreSQL compares
    // timestamps in the same timezone context, avoiding JS offset mismatches.
=======
    const { data: session, error: sessionError } = await supabase
      .from('session')
      .select('session_id, is_active, expires_at')
      .eq('session_id', session_id)

      .eq('is_active', true)
      .gt('expires_at', now.toISOString())
=======

      .maybeSingle();

    if (sessionError) throw sessionError;
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }


    // ── Validate student ─────────────────────────────────────────────────────
    const { data: student, error: studentError } = await supabase
      .from('student')
      .select('student_id, is_active')
      .eq('student_id', student_id)
      .maybeSingle();

    if (studentError) throw studentError;
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    if (!student.is_active) {
      return NextResponse.json({ error: 'Student account is inactive' }, { status: 403 });
    }

    // ── Generate token ───────────────────────────────────────────────────────
    // Expire in 30s (aligns with QR refresh interval)
    const newToken = nanoid(12); // URL-safe alphanumeric, 12 chars
    const tokenExpiresAt = new Date(Date.now() + 30 * 1000).toISOString();

    // ── UPSERT — UPDATE if row exists, INSERT if new ─────────────────────────
    // This is the key logic: the DB has UNIQUE(student_id, session_id),
    // so upsert always updates the existing row's token + expiry instead of
    // creating duplicate rows. This means:
    //   - Old token is invalidated (new token string replaces it)
    //   - used = false is reset so the new token can be scanned
    const { data: tokenRecord, error: upsertError } = await supabase
      .from('qr_token')
      .upsert(
        {
          student_id,
          session_id,
          token: newToken,
          expires_at: tokenExpiresAt,
          used: false,
        },
        {
          onConflict: 'student_id,session_id',
          ignoreDuplicates: false, // ensure it does UPDATE not skip
        }
      )
      .select('token_id, token, expires_at')
      .single();

    if (upsertError) throw upsertError;

    return NextResponse.json({
      success: true,
      token: tokenRecord.token,
      expires_at: tokenRecord.expires_at,
    });

  } catch (error) {
    console.error('[QR Token Error]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
