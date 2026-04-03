import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/teacher/register
 *
 * ⚠️  WEB APP ONLY — this route registers teachers.
 *     Mobile app should NEVER call this endpoint.
 *
 * Body:
 * {
 *   name:     string,
 *   email:    string,
 *   password: string,
 *   role?:    string   ← defaults to 'Staff'
 * }
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, password, role = 'Staff' } = body;

    // ── 1. Input validation ──────────────────────────────────────────────────
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'name, email, and password are required' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Whitelist allowed roles
    const allowedRoles = ['Staff', 'HOD', 'Admin'];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: `Invalid role. Allowed: ${allowedRoles.join(', ')}` }, { status: 400 });
    }

    // ── 2. Check for duplicate email ─────────────────────────────────────────
    const { data: existing } = await supabase
      .from('teacher')
      .select('teacher_id')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'A teacher with this email already exists' }, { status: 409 });
    }

    // ── 3. Hash password ─────────────────────────────────────────────────────
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // ── 4. Insert teacher ────────────────────────────────────────────────────
    const { data: teacher, error: insertError } = await supabase
      .from('teacher')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password_hash,
        role,
        is_active: true,
      })
      .select('teacher_id, name, email, role')
      .single();

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
      }
      throw insertError;
    }

    console.log(`[Teacher Register] id=${teacher.teacher_id} email=${teacher.email} role=${teacher.role}`);

    return NextResponse.json({
      success: true,
      message: 'Teacher registered successfully. You can now log in.',
      teacher: {
        teacher_id: teacher.teacher_id,
        name: teacher.name,
        email: teacher.email,
        role: teacher.role,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('[Teacher Register Error]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
