'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Shield, ArrowLeft, Mail, Lock, User, Briefcase } from 'lucide-react';
import Link from 'next/link';

/**
 * Web App Signup — TEACHER REGISTRATION ONLY
 * Students must register via the mobile app.
 */
const Signup = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Staff',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/teacher/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');

      setSuccess(true);
      setTimeout(() => router.push('/'), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────
  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '420px', padding: '44px 40px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 24px', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(16,185,129,0.2)' }}>
            <Shield size={32} color="#10B981" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>Account Created!</h2>
          <p style={{ color: 'var(--text-sub)', marginBottom: '8px' }}>Your teacher account has been created. Redirecting to login…</p>
        </div>
      </div>
    );
  }

  // ── Registration form ───────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '460px', padding: '44px 40px' }}>

        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'none', marginBottom: '24px' }}>
          <ArrowLeft size={16} /> Back to Login
        </Link>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', margin: '0 auto 16px', background: 'linear-gradient(135deg, #4F46E5, #38BDF8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(79,70,229,0.35)' }}>
            <UserPlus size={24} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, marginBottom: '6px' }}>Teacher Registration</h1>
          <p style={{ color: 'var(--text-sub)', fontSize: '0.875rem' }}>Create your staff account for the AMS Portal</p>
        </div>

        {/* Info banner */}
        <div style={{ marginBottom: '24px', padding: '12px 14px', borderRadius: '10px', background: 'rgba(79,70,229,0.08)', border: '1px solid rgba(79,70,229,0.2)', fontSize: '0.8125rem', color: 'var(--text-sub)', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <Shield size={15} style={{ color: '#818CF8', marginTop: '1px', flexShrink: 0 }} />
          <span>
            <strong style={{ color: 'var(--text-main)' }}>Students:</strong> Register via the <strong style={{ color: '#818CF8' }}>Mobile App</strong>, not here.
          </span>
        </div>

        {error && (
          <div style={{ marginBottom: '18px', padding: '11px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#FCA5A5', fontSize: '0.875rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input id="name" type="text" className="form-input" style={{ paddingLeft: '40px' }} placeholder="Dr. Jane Smith" value={formData.name} onChange={handleChange} required />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input id="email" type="email" className="form-input" style={{ paddingLeft: '40px' }} placeholder="teacher@college.edu" value={formData.email} onChange={handleChange} required />
            </div>
          </div>

          {/* Role */}
          <div className="form-group">
            <label className="form-label" htmlFor="role">Role</label>
            <div style={{ position: 'relative' }}>
              <Briefcase size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)', zIndex: 1 }} />
              <select id="role" className="form-input" style={{ paddingLeft: '40px', appearance: 'none' }} value={formData.role} onChange={handleChange}>
                <option value="Staff">Staff</option>
                <option value="HOD">HOD</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input id="password" type="password" className="form-input" style={{ paddingLeft: '40px' }} placeholder="Min 6 characters" value={formData.password} onChange={handleChange} required />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input id="confirmPassword" type="password" className="form-input" style={{ paddingLeft: '40px' }} placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '13px', fontSize: '0.9375rem' }}>
            {loading ? 'Creating Account…' : <><UserPlus size={18} /> Create Teacher Account</>}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link href="/" style={{ color: '#818CF8', textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
