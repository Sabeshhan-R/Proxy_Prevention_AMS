import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/auth/login
 *
 * Unified login for both students and teachers.
 * Body: { email, password, role: 'student' | 'teacher' }
 *
 * Security:
 * - Passwords are verified with bcrypt.compare (never plaintext match)
 * - Active flag checked
 * - Returns minimal user object (never returns password_hash)
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password, role } = body;
    const clientType = req.headers.get('x-client-type') || 'web'; // Default to web if not provided

    // ── Input validation ─────────────────────────────────────────────────────
    if (!email || !password || !role) {
      return NextResponse.json({ error: 'email, password, and role are required' }, { status: 400 });
    }

    if (!['student', 'teacher'].includes(role)) {
      return NextResponse.json({ error: 'role must be "student" or "teacher"' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // ── Lab Network Validation (Web Students Only) ──────────────────────────
    if (role === 'student' && clientType === 'web') {
      const forwarded = req.headers.get('x-forwarded-for');
      const remoteIp = forwarded ? forwarded.split(',')[0] : 'unknown';
      const isLocalhost = remoteIp === '::1' || remoteIp === '127.0.0.1' || remoteIp === '::ffff:127.0.0.1';
      const LAB_PUBLIC_IP = process.env.LAB_STATIC_IP || 'unknown'; 
      const isInLabNetwork = isLocalhost || (remoteIp === LAB_PUBLIC_IP) || (process.env.ALLOW_ALL_IPS === 'true');

      if (!isInLabNetwork) {
        return NextResponse.json({ 
          error: 'Unauthorized Network. Student portal is only accessible from Lab PCs.',
          ip: remoteIp 
        }, { status: 403 });
      }
    }

    // ── Student login ────────────────────────────────────────────────────────
    if (role === 'student') {
      const { data: student, error } = await supabase
        .from('student')
        .select('student_id, name, reg_no, dept, section, email, password_hash, device_id, is_active')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (error) throw error;

      if (!student) {
        return NextResponse.json(
          { error: 'No student account found with this email. Please register via the mobile app.' },
          { status: 401 }
        );
      }

      if (!student.is_active) {
        return NextResponse.json({ error: 'Your account has been deactivated. Contact admin.' }, { status: 403 });
      }

      // ── bcrypt verify ──────────────────────────────────────────────────────
      const passwordMatch = await bcrypt.compare(password, student.password_hash);
      if (!passwordMatch) {
        return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
      }

      return NextResponse.json({
        success: true,
        user: {
          id: student.reg_no,          // public display identifier
          uuid: student.student_id,    // DB UUID used in API calls
          name: student.name,
          role: 'student',
          email: student.email,
          dept: student.dept,
          section: student.section,
          device_id: student.device_id,
        },
      });
    }

    // ── Teacher login ────────────────────────────────────────────────────────
    if (role === 'teacher') {
      const { data: teacher, error } = await supabase
        .from('teacher')
        .select('teacher_id, name, email, password_hash, role, is_active')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (error) throw error;

      if (!teacher) {
        return NextResponse.json(
          { error: 'No teacher account found with this email.' },
          { status: 401 }
        );
      }

      if (!teacher.is_active) {
        return NextResponse.json({ error: 'Your account has been deactivated. Contact admin.' }, { status: 403 });
      }

      // ── bcrypt verify ────────────────────────────────────────────────────────
      const passwordMatch = await bcrypt.compare(password, teacher.password_hash);
      if (!passwordMatch) {
        return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
      }

      return NextResponse.json({
        success: true,
        user: {
          id: teacher.teacher_id,
          uuid: teacher.teacher_id,
          name: teacher.name,
          role: 'teacher',
          email: teacher.email,
          teacherRole: teacher.role,
        },
      });
    }

  } catch (error) {
    console.error('[Login Error]', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
