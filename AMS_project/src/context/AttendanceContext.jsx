'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';

const AttendanceContext = createContext();
export const useAttendance = () => useContext(AttendanceContext);

const LAB_ID = process.env.NEXT_PUBLIC_LAB_ID || 'LAB-01';

export const AttendanceProvider = ({ children }) => {
  const { user } = useAuth();

  const [session, setSession]           = useState(null);
  const [markedStudents, setMarkedStudents] = useState([]);
  const [loading, setLoading]           = useState(false);
  const [sessionError, setSessionError] = useState(null);
  const [labNetwork, setLabNetwork]     = useState({ checked: false, valid: false, ip: '' });

  const syncIntervalRef = useRef(null);

  // ── Session polling ─────────────────────────────────────────────────────
  // All users (student & teacher) poll every 5 seconds.
  // This ensures a student sees a new session within 5s of a teacher starting it.
  const syncSession = useCallback(async () => {
    if (!user) return;
    try {
      const resp = await fetch(`/api/sessions/status?lab_id=${LAB_ID}`);
      if (!resp.ok) return;
      const data = await resp.json();

      if (data.active) {
        setSession(prev => {
          // Avoid unnecessary re-renders if session_id hasn't changed
          if (prev?.id === data.session_id) return prev;
            return {
              id: data.session_id,
              expires_at: data.expires_at,
              lab_id: data.lab_id,
              teacher_name: data.teacher_name,
              remaining_seconds: data.remaining_seconds,
            };
        });
      } else {
        setSession(null);
      }
    } catch (err) {
      // Ignore network hiccups during polling
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      clearInterval(syncIntervalRef.current);
      setSession(null);
      setLabNetwork({ checked: false, valid: false, ip: '' });
      return;
    }
    
    // Check network once on login
    fetch('/api/validate-lab-network')
      .then(res => res.json())
      .then(data => setLabNetwork({ checked: true, valid: data.valid, ip: data.ip }))
      .catch(() => setLabNetwork({ checked: true, valid: false, ip: 'unknown' }));

    syncSession(); 
    syncIntervalRef.current = setInterval(syncSession, 5000);
    return () => clearInterval(syncIntervalRef.current);
  }, [user, syncSession]);

  // ── Teacher: start session ──────────────────────────────────────────────
  const startSession = useCallback(async (expires_in_minutes = 30) => {
    if (!user || user.role !== 'teacher') return;
    setLoading(true);
    setSessionError(null);
    try {
      const resp = await fetch('/api/start-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Client-Type': 'web' },
        body: JSON.stringify({
          teacher_id: user.uuid || user.id,
          lab_id: LAB_ID,
          expires_in_minutes,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Failed to start session');

      // Immediately update local state so teacher sees it right away
      setSession({
        id: data.session_id,
        expires_at: data.expires_at,
        lab_id: LAB_ID,
        teacher_name: user.name,
        remaining_seconds: data.remaining_seconds,
      });
      setMarkedStudents([]);
    } catch (err) {
      console.error('[StartSession]', err.message);
      setSessionError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ── Teacher: end session ────────────────────────────────────────────────
  const endSession = useCallback(async () => {
    if (!session) return;
    try {
      await fetch('/api/sessions/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Client-Type': 'web' },
        body: JSON.stringify({ session_id: session.id }),
      });
    } catch (err) {
      console.error('[EndSession]', err.message);
    }
    setSession(null);
  }, [session]);

  // ── Student: generate a QR token from backend ──────────────────────────
  // Returns the raw token string, or null on failure.
  const generateQRToken = useCallback(async (student_id, session_id) => {
    try {
      const resp = await fetch('/api/generate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Client-Type': 'web' },
        body: JSON.stringify({ student_id, session_id }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        console.error('[QR Token]', data.error);
        return null;
      }
      return data.token;
    } catch (err) {
      console.error('[QR Token]', err.message);
      return null;
    }
  }, []);

  // ── Teacher: mark student present (real-time sidebar update) ───────────
  const markStudentPresent = useCallback((studentData) => {
    setMarkedStudents(prev => {
      if (prev.find(s => s.studentId === studentData.studentId)) return prev;
      return [...prev, studentData];
    });
  }, []);

  return (
    <AttendanceContext.Provider value={{
      session,
      loading,
      sessionError,
      markedStudents,
      labNetwork,
      startSession,
      endSession,
      generateQRToken,
      markStudentPresent,
      LAB_ID,
    }}>
      {children}
    </AttendanceContext.Provider>
  );
};
