import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req) {
  try {
    const { name, email, password, id, role, dept, section } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing registration details' }, { status: 400 });
    }

    if (role === 'student') {
      if (!id || !dept || !section) {
        return NextResponse.json({ error: 'Missing student fields (Register No, Dept, Section)' }, { status: 400 });
      }

      // Check if student already exists by email or reg_no
      const { data: existingStudent } = await supabase
        .from('student')
        .select('reg_no, email')
        .or(`reg_no.eq.${id},email.eq.${email}`)
        .maybeSingle();

      if (existingStudent) {
        return NextResponse.json({ error: 'Student with this Register No or Email already exists' }, { status: 409 });
      }

      // Insert Student
      const { error: insertError } = await supabase
        .from('student')
        .insert({
          name,
          reg_no: id,
          dept,
          section,
          email,
          password_hash: password, // In production, hash this password!
          device_id: 'DEV-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
          is_active: true
        });

      if (insertError) throw insertError;

    } else if (role === 'teacher') {
      // Check if teacher already exists
      const { data: existingTeacher } = await supabase
        .from('teacher')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (existingTeacher) {
        return NextResponse.json({ error: 'Teacher with this email already exists' }, { status: 409 });
      }

      // Insert Teacher
      const { error: insertError } = await supabase
        .from('teacher')
        .insert({
          name,
          email,
          password_hash: password,
          role: 'Staff', // Default from schema
          is_active: true
        });

      if (insertError) throw insertError;
    }

    return NextResponse.json({ 
      success: true, 
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully` 
    });

  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
