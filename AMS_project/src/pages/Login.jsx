import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, GraduationCap, Users, Shield } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('student@ams.edu');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const switchRole = (r) => {
    setRole(r);
    setError('');
    setEmail(r === 'teacher' ? 'teacher@ams.edu' : 'student@ams.edu');
    setPassword('password123');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      const ok = login({ email, password, role });
      if (ok) navigate(role === 'teacher' ? '/teacher' : '/student');
      else { setError('Invalid credentials. Please try again.'); setLoading(false); }
    }, 700);
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

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input id="email" type="email" className="form-input" placeholder="Enter email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group" style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }} htmlFor="password">Password</label>
              <a href="#" style={{ fontSize: '0.78rem', color: '#818CF8', textDecoration: 'none' }}>Forgot?</a>
            </div>
            <input id="password" type="password" className="form-input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '13px', fontSize: '0.9375rem' }}>
            {loading ? 'Signing in…' : <><LogIn size={18} /> Sign In</>}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Demo: <span style={{ color: 'var(--text-sub)' }}>teacher@ams.edu</span> or <span style={{ color: 'var(--text-sub)' }}>student@ams.edu</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
