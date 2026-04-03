'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { LogIn, GraduationCap, Users, Shield, Mail, Lock } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const router = useRouter();

  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [networkStatus, setNetworkStatus] = useState({ checked: false, valid: false, ip: '' });

  // Early network check for students
  const checkNetwork = async () => {
    try {
      const res = await fetch('/api/validate-lab-network');
      const data = await res.json();
      setNetworkStatus({ checked: true, valid: data.valid, ip: data.ip });
    } catch {
      setNetworkStatus({ checked: true, valid: false, ip: 'unknown' });
    }
  };

  const switchRole = (r) => {
    setRole(r);
    setError('');
    if (r === 'student') {
      checkNetwork();
    }
  };

  useEffect(() => {
    if (role === 'student') checkNetwork();
  }, [role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Re-check network if student
    if (role === 'student') {
      await checkNetwork();
    }

    try {
      const result = await login({ email, password, role });
      if (result.success) {
        router.push(role === 'teacher' ? '/teacher' : '/student');
      } else {
        setError(result.error || 'Invalid credentials. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '420px', padding: '44px 40px' }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px', margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #4F46E5, #38BDF8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 24px rgba(79,70,229,0.4)'
          }}>
            <Shield size={26} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, marginBottom: '6px' }}>AMS Portal</h1>
          <p style={{ color: 'var(--text-sub)', fontSize: '0.875rem' }}>Attendance Management System</p>
        </div>

        {/* Role Toggle */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '28px' }}>
          {[
            { key: 'student', label: 'Student', Icon: GraduationCap },
            { key: 'teacher', label: 'Teacher', Icon: Users },
          ].map(({ key, label, Icon }) => (
            <button key={key} type="button" onClick={() => switchRole(key)} style={{
              padding: '14px 10px',
              borderRadius: '10px',
              border: `1px solid ${role === key ? '#4F46E5' : 'var(--border)'}`,
              background: role === key ? 'rgba(79,70,229,0.15)' : 'rgba(8,11,20,0.5)',
              color: role === key ? '#c7d2fe' : 'var(--text-sub)',
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
              fontFamily: 'inherit', fontWeight: 500, fontSize: '0.875rem',
              transition: 'all 0.18s ease',
              boxShadow: role === key ? '0 0 0 1px rgba(79,70,229,0.3)' : 'none',
            }}>
              <Icon size={22} />
              {label}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ marginBottom: '18px', padding: '11px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#FCA5A5', fontSize: '0.875rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {role === 'student' && networkStatus.checked && !networkStatus.valid && (
          <div style={{ marginBottom: '18px', padding: '14px', borderRadius: '12px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', textAlign: 'center' }}>
            <p style={{ color: '#FCA5A5', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>Unauthorized Network</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: 1.4 }}>Only Lab PCs can access the student portal. <br/> Your IP: <code style={{ color: '#FCA5A5' }}>{networkStatus.ip}</code></p>
          </div>
        )}

        {role === 'student' && networkStatus.checked && networkStatus.valid && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '18px', padding: '8px', borderRadius: '8px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#34D399' }}>Verified Lab Network</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input id="email" type="email" className="form-input" style={{ paddingLeft: '40px' }} placeholder="Enter email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }} htmlFor="password">Password</label>
              <a href="#" style={{ fontSize: '0.78rem', color: '#818CF8', textDecoration: 'none' }}>Forgot?</a>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input id="password" type="password" className="form-input" style={{ paddingLeft: '40px' }} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '13px', fontSize: '0.9375rem' }}>
            {loading ? 'Signing in…' : <><LogIn size={18} /> Sign In</>}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Don't have an account? <a href="/signup" style={{ color: '#818CF8', textDecoration: 'none', fontWeight: 600 }}>Create One</a>
        </p>

      </div>
    </div>
  );
};

export default Login;
