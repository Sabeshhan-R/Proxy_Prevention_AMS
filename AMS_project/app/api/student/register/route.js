import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/student/register
 *
 * ⚠️  MOBILE APP ONLY — this route registers students.
 *     Web app should NEVER call this endpoint.
 *
 * Body:
 * {
 *   name:      string,
 *   reg_no:    string,  ← student registration number (unique)
 *   dept:      string,
 *   section:   string,
 *   email:     string,
 *   password:  string,
 *   device_id: string   ← unique ID of the student's mobile device
 * }
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { name, reg_no, dept, section, email, password, device_id } = body;

    // ── 1. Input validation ──────────────────────────────────────────────────
    if (!name || !reg_no || !dept || !section || !email || !password || !device_id) {
      return NextResponse.json(
        { error: 'All fields are required: name, reg_no, dept, section, email, password, device_id' },
        { status: 400 }
      );
    }

    // Email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Password minimum length
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // ── 2. Check for duplicates ──────────────────────────────────────────────
    const { data: existing } = await supabase
      .from('student')
      .select('student_id, reg_no, email, device_id')
      .or(`reg_no.eq.${reg_no},email.eq.${email},device_id.eq.${device_id}`)
      .maybeSingle();

    if (existing) {
      if (existing.reg_no === reg_no) {
        return NextResponse.json({ error: 'A student with this Registration Number already exists' }, { status: 409 });
      }
      if (existing.email === email) {
        return NextResponse.json({ error: 'A student with this email already exists' }, { status: 409 });
      }
      if (existing.device_id === device_id) {
        return NextResponse.json({ error: 'This device is already registered to another student account' }, { status: 409 });
      }
    }

    // ── 3. Hash password ─────────────────────────────────────────────────────
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // ── 4. Insert student ────────────────────────────────────────────────────
    const { data: student, error: insertError } = await supabase
      .from('student')
      .insert({
        name: name.trim(),
        reg_no: reg_no.trim().toUpperCase(),
        dept: dept.trim().toUpperCase(),
        section: section.trim().toUpperCase(),
        email: email.trim().toLowerCase(),
        password_hash,
        device_id,           // bound to this device permanently at registration
        is_active: true,
      })
      .select('student_id, name, reg_no, dept, section, email')
      .single();

    if (insertError) {
      // Handle DB-level duplicate constraint violations
      if (insertError.code === '23505') {
        return NextResponse.json({ error: 'Registration No. or Email already in use' }, { status: 409 });
      }
      throw insertError;
    }

    console.log(`[Student Register] id=${student.student_id} reg_no=${student.reg_no} device=${device_id}`);

    return NextResponse.json({
      success: true,
      message: 'Student registered successfully. You can now log in.',
      student: {
        student_id: student.student_id,
        name: student.name,
        reg_no: student.reg_no,
        dept: student.dept,
        section: student.section,
        email: student.email,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('[Student Register Error]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
