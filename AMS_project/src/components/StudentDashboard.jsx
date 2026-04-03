'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAttendance } from '../context/AttendanceContext';
import { LogOut, CheckCircle, RefreshCw, Wifi, WifiOff, Shield, Clock } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const QR_REFRESH_SECONDS = 28; // slightly under token lifetime of 30s

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const { session, generateQRToken, labNetwork } = useAttendance();

    const [qrData, setQrData]           = useState(null);     // JSON string encoded in QR
    const [qrRefreshIn, setQrRefreshIn] = useState(QR_REFRESH_SECONDS);
    const [qrLoading, setQrLoading]     = useState(false);
    const [qrError, setQrError]         = useState(null);
    const [scanStatus, setScanStatus]   = useState('idle'); // idle | success | error
    const [markTime, setMarkTime]       = useState(null);
  
    const refreshTimerRef  = useRef(null);
    const countdownTimerRef = useRef(null);
    const isMounted        = useRef(true);
  
    useEffect(() => {
      isMounted.current = true;
      return () => { isMounted.current = false; };
    }, []);
  
    // ── QR Generation ────────────────────────────────────────────────────────
    const generateQR = useCallback(async () => {
      if (!session || !user) return;
  
      const studentUuid = user.uuid || user.id;
      if (!studentUuid || !session.id) return;
  
      // Pre-check lab network
      if (labNetwork.checked && !labNetwork.valid) {
        setQrError('Unauthorized Network. Student portal is only accessible from Lab PCs.');
        return;
      }

      setQrLoading(true);
      setQrError(null);
  
      try {
        const token = await generateQRToken(studentUuid, session.id);
  
        if (!isMounted.current) return;
  
        if (token) {
          // Encode everything the scanner needs into the QR
          const payload = JSON.stringify({
            student_id: studentUuid,
            session_id: session.id,
            token: token,
            device_id: user.device_id || 'DEMO-DEVICE',
          });
          setQrData(payload);
          setQrError(null);
          setQrRefreshIn(QR_REFRESH_SECONDS);
        } else {
          setQrError('Could not generate QR token. Please ensure you are on the Lab Network.');
          setQrData(null);
        }
      } catch {
        if (isMounted.current) setQrError('Network error. Retrying…');
      } finally {
        if (isMounted.current) setQrLoading(false);
      }
    }, [session, user, labNetwork, generateQRToken]);

  // ── Lifecycle — start refresh cycle when session becomes active ──────────
  useEffect(() => {
    // Clear everything when there is no session
    if (!session || !user) {
      setQrData(null);
      setQrError(null);
      setScanStatus('idle');
      clearInterval(refreshTimerRef.current);
      clearInterval(countdownTimerRef.current);
      setQrRefreshIn(QR_REFRESH_SECONDS);
      return;
    }

    // Immediate generation
    generateQR();

    // Refresh QR every QR_REFRESH_SECONDS
    refreshTimerRef.current = setInterval(generateQR, QR_REFRESH_SECONDS * 1000);

    // Countdown ticker
    countdownTimerRef.current = setInterval(() => {
      setQrRefreshIn(prev => (prev <= 1 ? QR_REFRESH_SECONDS : prev - 1));
    }, 1000);

    return () => {
      clearInterval(refreshTimerRef.current);
      clearInterval(countdownTimerRef.current);
    };
  }, [session?.id, user?.uuid, generateQR]); // only re-run when session ID or user changes

  const progressPct = ((QR_REFRESH_SECONDS - qrRefreshIn) / QR_REFRESH_SECONDS) * 100;

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh' }}>
      {/* ── Header ── */}
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #0EA5E9, #10B981)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(14,165,233,0.35)', flexShrink: 0
            }}>
              <Shield size={18} color="#fff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>{user?.name}</span>
                <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Student</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: '1px' }}>
                Reg: {user?.id} {user?.dept && `· ${user.dept}`} {user?.section && `· Sec ${user.section}`}
              </p>
            </div>
          </div>
          <button onClick={logout} className="btn btn-outline" style={{ padding: '7px 14px' }}>
            <LogOut size={15} /> Logout
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '480px', margin: '0 auto', padding: '40px 24px' }} className="animate-fade-in">

        {/* ── SUCCESS STATE ─────────────────────────────── */}
        {scanStatus === 'success' ? (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 0 30px rgba(16,185,129,0.2)' }}>
              <CheckCircle size={48} color="#10B981" />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34D399', marginBottom: '8px' }}>Marked Present!</h2>
            <p style={{ color: 'var(--text-sub)', marginBottom: '28px' }}>Your attendance has been recorded.</p>
            <div style={{ background: 'rgba(8,11,20,0.5)', borderRadius: '12px', padding: '16px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-sub)', fontSize: '0.875rem' }}>Name</span>
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-sub)', fontSize: '0.875rem' }}>Session</span>
                <code style={{ fontSize: '0.7rem', color: '#818CF8' }}>{session?.id?.slice(0, 12)}…</code>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <span style={{ color: 'var(--text-sub)', fontSize: '0.875rem' }}>Marked at</span>
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{markTime}</span>
              </div>
            </div>
          </div>

        ) : (
          <div className="glass-panel" style={{ padding: '36px' }}>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '6px', textAlign: 'center' }}>
              Attendance QR
            </h2>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.875rem', textAlign: 'center', marginBottom: '28px' }}>
              {session ? 'Show this code to the scanner or mobile app.' : 'Waiting for teacher to start the session…'}
            </p>

            {/* ── NO SESSION ──────────────────── */}
            {!session ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '16px', border: '2px dashed rgba(148,163,184,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', background: 'rgba(8,11,20,0.4)' }}>
                  <div style={{ opacity: 0.3, fontSize: '2.5rem' }}>⬜</div>
                </div>
                <h3 style={{ fontWeight: 600, marginBottom: '8px', opacity: 0.6 }}>No Active Session</h3>
                <p style={{ color: 'var(--text-sub)', fontSize: '0.8125rem' }}>Your teacher hasn't started attendance yet.</p>
              </div>

            ) : (
              /* ── QR ACTIVE ────────────────────── */
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                {/* QR box */}
                <div style={{ position: 'relative', marginBottom: '20px' }}>
                  <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 0 40px rgba(79,70,229,0.3)' }}>
                    {qrLoading && !qrData ? (
                      <div style={{ width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <RefreshCw size={32} className="animate-spin" color="#4F46E5" />
                      </div>
                    ) : qrError ? (
                      <div style={{ width: '220px', height: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                        <WifiOff size={32} color="#EF4444" />
                        <p style={{ fontSize: '0.75rem', color: '#FCA5A5', textAlign: 'center', padding: '0 8px' }}>{qrError}</p>
                      </div>
                    ) : qrData ? (
                      <>
                        <QRCodeSVG value={qrData} size={220} level="H" includeMargin={false} />
                        {/* Animated scan line */}
                        <div style={{
                          position: 'absolute', left: '20px', right: '20px', height: '3px',
                          background: 'linear-gradient(90deg, transparent, #4F46E5, transparent)',
                          animation: 'scanline 2.5s linear infinite', top: '20px',
                          pointerEvents: 'none'
                        }} />
                        <style>{`@keyframes scanline { 0%{top:20px;opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{top:calc(100% - 20px);opacity:0} }`}</style>
                      </>
                    ) : null}
                  </div>
                </div>

                {/* Session info badge */}
                {session.teacher_name && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)', marginBottom: '12px' }}>
                    Session by <strong style={{ color: 'var(--text-main)' }}>{session.teacher_name}</strong>
                  </p>
                )}

                {/* Countdown bar */}
                <div style={{ width: '100%', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-sub)', marginBottom: '6px' }}>
                    <span>QR refreshes in</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: qrRefreshIn <= 5 ? '#F59E0B' : 'inherit' }}>
                      {qrRefreshIn}s
                    </span>
                  </div>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '999px',
                      transition: 'width 1s linear',
                      background: qrRefreshIn <= 5
                        ? 'linear-gradient(90deg, #F59E0B, #EF4444)'
                        : 'linear-gradient(90deg, #4F46E5, #38BDF8)',
                      width: `${progressPct}%`
                    }} />
                  </div>
                </div>

                {/* Session expiry */}
                {session.expires_at && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-sub)', marginBottom: '16px' }}>
                    <Clock size={13} />
                    Session ends at {new Date(session.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}

                {/* Network indicator */}
                <div style={{ 
                  display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', 
                  color: !labNetwork.valid ? '#EF4444' : '#34D399', 
                  marginBottom: '24px', background: 'rgba(255,255,255,0.03)', padding: '8px 16px', borderRadius: '99px' 
                }}>
                  {!labNetwork.valid ? (
                    <>
                      <WifiOff size={14} /> 
                      <span>Network Restricted · IP: <code style={{ color: '#FCA5A5' }}>{labNetwork.ip || 'Unknown'}</code></span>
                    </>
                  ) : (
                    <>
                      <Wifi size={14} /> 
                      <span>Lab Network Verified {labNetwork.ip && `· ${labNetwork.ip}`}</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
};

export default StudentDashboard;
