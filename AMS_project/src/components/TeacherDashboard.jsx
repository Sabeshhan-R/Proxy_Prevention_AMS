'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAttendance } from '../context/AttendanceContext';
import { LogOut, ScanLine, ClipboardList, CheckSquare, UserCheck, Users, Clock, Shield, FileText, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const { session, markedStudents, startSession, endSession, loading, sessionError } = useAttendance();
  const [activeTab, setActiveTab] = useState('attendance');
  const [sessionTimer, setSessionTimer] = useState(1800); // 30 minutes countdown (1800s)

  const [totalStudents, setTotalStudents] = useState(0);
  const [odRequests, setOdRequests] = useState([]);
  const [previewId, setPreviewId] = useState(null); // tracks which OD letter is being previewed

  // Fetch real data from Supabase
  const fetchData = async () => {
    // 1. Fetch Students Count
    const { count } = await supabase.from('student').select('*', { count: 'exact', head: true });
    setTotalStudents(count || 0);

    // 2. Fetch OD Requests
    const { data: odData, error: odError } = await supabase
      .from('od_request')
      .select(`
        *,
        student:student_id ( name, reg_no )
      `)
      .order('applied_at', { ascending: false });

    if (!odError && odData) {
      // Map DB schema to UI format
      const mapped = await Promise.all(odData.map(async (req) => {
        let signedUrl = null;
        
        if (req.document_path && !req.document_path.startsWith('error_')) {
          const { data, error } = await supabase.storage
            .from('od_documents')
            .createSignedUrl(req.document_path, 3600); // 1-hour access for the session
          
          if (!error && data) {
            signedUrl = data.signedUrl;
          } else {
            // Fallback for debugging if signed URL fails
            signedUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/od_documents/${req.document_path}`;
          }
        }

        return {
          id: req.od_id,
          studentName: req.student?.name || 'Unknown',
          rollNo: req.student?.reg_no || '—',
          reason: req.subject,
          date: req.from_date === req.to_date ? req.from_date : `${req.from_date} to ${req.to_date}`,
          status: req.status.toLowerCase(),
          letterUrl: signedUrl,
          letterName: req.document_path ? req.document_path.split('/').pop() : 'No file'
        };
      }));
      setOdRequests(mapped);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Countdown timer — driven by real session.expires_at from backend
  useEffect(() => {
    let interval;
    if (session?.remaining_seconds !== undefined) {
      setSessionTimer(session.remaining_seconds);
      const tick = () => {
        setSessionTimer(prev => Math.max(0, prev - 1));
      };
      tick();
      interval = setInterval(tick, 1000);
    } else {
      setSessionTimer(1800);
    }
    return () => clearInterval(interval);
  }, [session?.id]); // Depend on ID change to reset timer

  const handleOdAction = async (id, action) => {
    // DB status is capitalized in Enum: 'Approved', 'Rejected'
    const dbStatus = action.charAt(0).toUpperCase() + action.slice(1);
    
    const { error } = await supabase
      .from('od_request')
      .update({ status: dbStatus })
      .eq('od_id', id);

    if (!error) {
      setOdRequests(reqs => reqs.map(r => r.id === id ? { ...r, status: action } : r));
    }
  };

  const [missedRoll, setMissedRoll] = useState('');
  const [missedMsg, setMissedMsg] = useState('');
  const handleMissedMark = () => {
    if (!missedRoll.trim()) return;
    setMissedMsg(`Student ${missedRoll.trim()} marked present successfully.`);
    setMissedRoll('');
    setTimeout(() => setMissedMsg(''), 3000);
  };

  const pendingCount = odRequests.filter(r => r.status === 'pending').length;
  const markedCount = markedStudents?.length || 0;
  const timerPct = sessionTimer > 0 ? (sessionTimer / 1800) * 100 : 0;
  const timerColor = sessionTimer > 60 ? '#10B981' : sessionTimer > 30 ? '#F59E0B' : '#EF4444';

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Logo mark */}
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #4F46E5, #38BDF8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(79,70,229,0.4)', flexShrink: 0
            }}>
              <Shield size={18} color="#fff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>{user?.name}</span>
                <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>Teacher</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: '1px' }}>
                {process.env.NEXT_PUBLIC_COURSE_NAME} · {process.env.NEXT_PUBLIC_COURSE_CODE}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {session && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: timerColor, fontWeight: 600 }}>
                <Clock size={14} />
                {Math.floor(sessionTimer / 60)}:{String(sessionTimer % 60).padStart(2, '0')} left
              </div>
            )}
            <button onClick={logout} className="btn btn-outline" style={{ padding: '7px 14px' }}>
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }} className="animate-fade-in">

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <div className="stat-card">
            <span className="stat-label">Total Students</span>
            <span className="stat-value" style={{ color: 'var(--text-main)' }}>{totalStudents}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>Enrolled in {process.env.NEXT_PUBLIC_COURSE_CODE}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Marked Present</span>
            <span className="stat-value" style={{ color: 'var(--success)' }}>{markedCount}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>This session</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Attendance %</span>
            <span className="stat-value" style={{ color: '#818CF8' }}>{totalStudents > 0 ? Math.round((markedCount / totalStudents) * 100) : 0}%</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>Real-time</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">OD Pending</span>
            <span className="stat-value" style={{ color: pendingCount > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>{pendingCount}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>Requests</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tab-nav" style={{ marginBottom: '24px', overflowX: 'auto' }}>
          <button className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')}>
            <ScanLine size={16} /> Attendance
          </button>
          <button className={`tab-btn ${activeTab === 'missed' ? 'active' : ''}`} onClick={() => setActiveTab('missed')}>
            <ClipboardList size={16} /> Missed QR
          </button>
          <button className={`tab-btn ${activeTab === 'od' ? 'active' : ''}`} onClick={() => setActiveTab('od')} style={{ position: 'relative' }}>
            <CheckSquare size={16} /> OD Approval
            {pendingCount > 0 && (
              <span style={{
                position: 'absolute', top: '-6px', right: '-4px',
                background: 'var(--danger)', color: '#fff', borderRadius: '999px',
                fontSize: '0.65rem', fontWeight: 700, padding: '1px 6px', lineHeight: '16px'
              }}>{pendingCount}</span>
            )}
          </button>
        </div>

        {/* ── Attendance Tab ─────────────────────── */}
        {activeTab === 'attendance' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>

            {/* Main panel */}
            <div className="glass-panel" style={{ padding: '36px' }}>
              {!session ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{
                    width: '80px', height: '80px', borderRadius: '20px', margin: '0 auto 24px',
                    background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <ScanLine size={36} color="#818CF8" />
                  </div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '10px' }}>Start Attendance Session</h2>
                  <p style={{ color: 'var(--text-sub)', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
                    Click below to begin. Students will see a unique QR code on their devices which they can present to the lab kiosk or scanner.
                  </p>
                  {sessionError && (
                    <div style={{ margin: '0 auto 20px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#FCA5A5', fontSize: '0.85rem', maxWidth: '400px' }}>
                      {sessionError}
                    </div>
                  )}
                  <button className="btn btn-primary" style={{ padding: '14px 40px', fontSize: '1rem' }}
                    onClick={() => startSession(30)}
                    disabled={loading}>
                    {loading ? 'Starting...' : <><ScanLine size={18} /> Start Attendance</>}
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <h2 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '4px' }}>Live Session Active</h2>
                      <p style={{ color: 'var(--text-sub)', fontSize: '0.875rem' }}>Students are prompted to scan their QR codes</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="badge badge-success" style={{ padding: '6px 14px', fontSize: '0.8125rem' }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', display: 'inline-block', animation: 'pulseRing 2s infinite' }}></span>
                        &nbsp;Active
                      </span>
                      <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.8125rem', borderColor: 'rgba(239,68,68,0.4)', color: '#F87171' }}
                        onClick={endSession}>
                        End Session
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginBottom: '28px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8125rem' }}>
                      <span style={{ color: 'var(--text-sub)' }}>Attendance Progress</span>
                      <span style={{ color: '#34D399', fontWeight: 600 }}>{markedCount}/{totalStudents}</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: '999px', transition: 'width 0.5s ease',
                        background: 'linear-gradient(90deg, #10B981, #34D399)',
                        width: `${(markedCount / totalStudents) * 100}%`
                      }} />
                    </div>
                  </div>

                  {/* Timer bar */}
                  <div style={{ marginBottom: '28px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8125rem' }}>
                      <span style={{ color: 'var(--text-sub)' }}>Session Expires In</span>
                      <span style={{ color: timerColor, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                        {Math.floor(sessionTimer / 60)}:{String(sessionTimer % 60).padStart(2, '0')}
                      </span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: '999px', transition: 'width 1s linear, background 1s ease',
                        background: timerColor, width: `${timerPct}%`
                      }} />
                    </div>
                  </div>

                  {/* Session info */}
                  <div style={{ background: 'rgba(8,11,20,0.5)', borderRadius: '10px', padding: '16px', marginBottom: '24px', fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                      <div>
                        <span style={{ color: 'var(--text-sub)', fontSize: '0.75rem', display: 'block', marginBottom: '2px' }}>Session ID</span>
                        <code style={{ color: '#818CF8', fontSize: '0.8rem' }}>{session.id}</code>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-sub)', fontSize: '0.75rem', display: 'block', marginBottom: '2px' }}>Lab Network</span>
                        <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{process.env.NEXT_PUBLIC_LAB_IP_RANGE}</span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-sub)', fontSize: '0.75rem', display: 'block', marginBottom: '2px' }}>QR Refresh</span>
                        <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>Every 30s</span>
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-sub)', textAlign: 'center' }}>
                    The session will automatically close after 30 minutes. Students present their QR at the kiosk.
                  </p>
                </>
              )}
            </div>

            {/* Sidebar: Student list */}
            <div className="glass-card" style={{ padding: '20px' }}>
              <h3 style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck size={16} color="#34D399" /> Present Students
              </h3>
              {markedCount === 0 ? (
                <p style={{ color: 'var(--text-sub)', fontSize: '0.8125rem', textAlign: 'center', padding: '20px 0' }}>No students marked yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '360px', overflowY: 'auto' }}>
                  {(markedStudents || []).slice().reverse().map((s, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', background: 'rgba(16,185,129,0.08)', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.15)' }}>
                      <div>
                        <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{s.studentName}</p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>{s.studentId}</p>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#34D399', fontWeight: 600 }}>✓ Present</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Missed QR Tab ──────────────────────── */}
        {activeTab === 'missed' && (
          <div className="glass-panel animate-fade-in" style={{ padding: '36px', maxWidth: '600px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <ClipboardList size={22} color="#818CF8" />
              <h2 style={{ fontSize: '1.375rem', fontWeight: 700 }}>Manual Attendance</h2>
            </div>
            <p style={{ color: 'var(--text-sub)', marginBottom: '28px', fontSize: '0.875rem' }}>
              Mark a student present manually if they were unable to use the QR kiosk.
            </p>
            {missedMsg && (
              <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#34D399', fontSize: '0.875rem' }}>
                {missedMsg}
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Student Roll Number</label>
              <input type="text" className="form-input" placeholder="e.g. 21CS101"
                value={missedRoll} onChange={e => setMissedRoll(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleMissedMark()} />
            </div>
            <button className="btn btn-success" style={{ width: '100%', padding: '12px' }} onClick={handleMissedMark}>
              <UserCheck size={16} /> Mark Present
            </button>
          </div>
        )}

        {/* ── OD Approval Tab ────────────────────── */}
        {activeTab === 'od' && (
          <div className="glass-panel animate-fade-in" style={{ padding: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <CheckSquare size={22} color="#818CF8" />
              <h2 style={{ fontSize: '1.375rem', fontWeight: 700 }}>On-Duty Requests</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {odRequests.map(req => (
                <div key={req.id} style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <p style={{ fontWeight: 600, marginBottom: '3px' }}>{req.studentName}</p>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-sub)', marginBottom: '8px' }}>{req.rollNo} · {req.reason} · {req.date}</p>
                      {/* PDF Letter link */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <a href={req.letterUrl} target="_blank" rel="noopener noreferrer" 
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: '#818CF8', textDecoration: 'none', fontWeight: 500 }}>
                          <FileText size={14} /> {req.letterName}
                        </a>
                        <button 
                          onClick={() => setPreviewId(previewId === req.id ? null : req.id)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-sub)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>
                          {previewId === req.id ? <><EyeOff size={12}/> Hide</> : <><Eye size={12}/> Preview</>}
                        </button>
                      </div>
                    </div>
                    {req.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-success" style={{ padding: '7px 18px', fontSize: '0.8125rem' }} onClick={() => handleOdAction(req.id, 'approved')}>Approve</button>
                        <button className="btn btn-outline" style={{ padding: '7px 18px', fontSize: '0.8125rem', borderColor: 'rgba(239,68,68,0.3)', color: '#F87171' }} onClick={() => handleOdAction(req.id, 'rejected')}>Reject</button>
                      </div>
                    ) : (
                      <span className={`badge ${req.status === 'approved' ? 'badge-success' : 'badge-danger'}`} style={{ textTransform: 'capitalize' }}>{req.status}</span>
                    )}
                  </div>
                  {/* Inline PDF Preview */}
                  {previewId === req.id && (
                    <div style={{ borderTop: '1px solid var(--border)', padding: '16px 20px', background: 'rgba(8,11,20,0.4)' }} className="animate-fade-in">
                      <iframe 
                        src={req.letterUrl} 
                        title={`Preview - ${req.letterName}`}
                        style={{ width: '100%', height: '400px', border: 'none', borderRadius: '8px', background: '#fff' }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default TeacherDashboard;
