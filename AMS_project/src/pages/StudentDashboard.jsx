import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAttendance } from '../context/AttendanceContext';
import { LogOut, CheckCircle, XCircle, RefreshCw, Wifi, Shield } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const { session, generateStudentPayload } = useAttendance();

  // Local QR state — refresh every 30s independently
  const [qrData, setQrData] = useState(null);
  const [qrRefreshIn, setQrRefreshIn] = useState(30);
  const [scanStatus, setScanStatus] = useState('idle'); // idle | success | error
  const [markTime, setMarkTime] = useState(null);
  const refreshRef = useRef(null);
  const countdownRef = useRef(null);

  // Generate / refresh QR every 30 seconds when session is active
  useEffect(() => {
    if (!session || !user) {
      setQrData(null);
      clearInterval(refreshRef.current);
      clearInterval(countdownRef.current);
      setQrRefreshIn(30);
      setScanStatus('idle');
      return;
    }

    const generateQR = () => {
      const payload = generateStudentPayload(user);
      setQrData(JSON.stringify(payload));
      setQrRefreshIn(30);
    };

    generateQR(); // immediate

    refreshRef.current = setInterval(() => {
      generateQR();
    }, 30000);

    countdownRef.current = setInterval(() => {
      setQrRefreshIn(prev => (prev <= 1 ? 30 : prev - 1));
    }, 1000);

    return () => {
      clearInterval(refreshRef.current);
      clearInterval(countdownRef.current);
    };
  }, [session, user, generateStudentPayload]);

  // Simulate kiosk scan response (real system: kiosk calls backend, backend updates via websocket)
  const simulateKioskScan = () => {
    setScanStatus('success');
    setMarkTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  const resetStatus = () => setScanStatus('idle');

  const progressPct = ((30 - qrRefreshIn) / 30) * 100;

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
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
              <p style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: '1px' }}>Roll: 21CS{user?.id?.toUpperCase()}</p>
            </div>
          </div>
          <button onClick={logout} className="btn btn-outline" style={{ padding: '7px 14px' }}>
            <LogOut size={15} /> Logout
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '480px', margin: '0 auto', padding: '40px 24px' }} className="animate-fade-in">

        {/* ── SUCCESS STATE ────────────────────── */}
        {scanStatus === 'success' ? (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', animation: 'fadeInUp 0.4s ease' }}>
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 0 30px rgba(16,185,129,0.2)' }}>
              <CheckCircle size={48} color="#10B981" />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34D399', marginBottom: '8px' }}>Marked Present!</h2>
            <p style={{ color: 'var(--text-sub)', marginBottom: '28px' }}>Your attendance has been recorded successfully.</p>

            <div style={{ background: 'rgba(8,11,20,0.5)', borderRadius: '12px', padding: '16px', marginBottom: '24px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-sub)', fontSize: '0.875rem' }}>Name</span>
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-sub)', fontSize: '0.875rem' }}>Session ID</span>
                <code style={{ fontSize: '0.75rem', color: '#818CF8' }}>{session?.id}</code>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <span style={{ color: 'var(--text-sub)', fontSize: '0.875rem' }}>Time</span>
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{markTime}</span>
              </div>
            </div>
          </div>

        ) : (
          <div className="glass-panel" style={{ padding: '36px' }}>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '6px', textAlign: 'center' }}>Take Attendance</h2>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.875rem', textAlign: 'center', marginBottom: '28px' }}>
              {session ? 'Show the QR code below to the lab kiosk or scanner.' : 'Waiting for the teacher to start the session…'}
            </p>

            {!session ? (
              /* ── WAITING STATE ───────────────── */
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '16px', border: '2px dashed rgba(148,163,184,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', background: 'rgba(8,11,20,0.4)' }}>
                  <div style={{ opacity: 0.3, fontSize: '2.5rem' }}>⬜</div>
                </div>
                <h3 style={{ fontWeight: 600, marginBottom: '8px', opacity: 0.6 }}>No Active Session</h3>
                <p style={{ color: 'var(--text-sub)', fontSize: '0.8125rem', marginBottom: '28px' }}>Please wait for your teacher to open the attendance session.</p>
                <button disabled className="btn btn-primary" style={{ width: '100%', padding: '12px', opacity: 0.4 }}>
                  Attendance Unavailable
                </button>
              </div>
            ) : (
              /* ── QR CODE STATE ───────────────── */
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* QR Code */}
                <div style={{ position: 'relative', marginBottom: '20px' }}>
                  <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 0 40px rgba(79,70,229,0.3)' }} className="qr-glow">
                    {qrData ? (
                      <>
                        <QRCodeSVG value={qrData} size={220} level="H" includeMargin={false} />
                        {/* Scan line animation */}
                        <div style={{ position: 'absolute', left: '20px', right: '20px', height: '3px', background: 'linear-gradient(90deg, transparent, #4F46E5, transparent)', animation: 'scan 2.5s linear infinite', top: '20px' }} />
                        <style>{`@keyframes scan { 0%{top:20px;opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{top:calc(100% - 20px);opacity:0} }`}</style>
                      </>
                    ) : (
                      <div style={{ width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <RefreshCw size={32} className="animate-spin" color="#4F46E5" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Refresh countdown */}
                <div style={{ width: '100%', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-sub)', marginBottom: '6px' }}>
                    <span>QR refreshes in</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{qrRefreshIn}s</span>
                  </div>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'linear-gradient(90deg, #4F46E5, #38BDF8)', borderRadius: '999px', transition: 'width 1s linear', width: `${progressPct}%` }} />
                  </div>
                </div>

                {/* Network status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#34D399', marginBottom: '24px' }}>
                  <Wifi size={14} />
                  Connected · {user?.labIp}
                </div>

                {/* Demo button — in real system removed; kiosk marks automatically */}
                <button className="btn btn-success" style={{ width: '100%', padding: '13px', fontSize: '0.9375rem' }} onClick={simulateKioskScan}>
                  <CheckCircle size={17} /> Simulate Kiosk Scan (Demo)
                </button>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '10px', textAlign: 'center' }}>
                  In production, the kiosk reads your QR automatically.
                </p>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
};

export default StudentDashboard;
