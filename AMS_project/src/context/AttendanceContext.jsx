import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AttendanceContext = createContext();

export const useAttendance = () => useContext(AttendanceContext);

export const AttendanceProvider = ({ children }) => {
  const [session, setSession] = useState(null); // { id, startTime, course }
  const [markedStudents, setMarkedStudents] = useState([]); // Array of string IDs or objects

  // Helper function for the StudentDashboard to generate their personal QR payload.
  // This does NOT live in global state because it is unique to the user viewing it.
  const generateStudentPayload = useCallback((user) => {
    if (!session || !user) return null;
    return {
      sessionId: session.id,
      studentId: user.id,
      studentName: user.name,
      timestamp: Date.now(),
      labIpAuth: user.labIp, // The IP the student is claiming
    };
  }, [session]);

  // End session automatically after 2 minutes (120,000 ms)
  useEffect(() => {
    let sessionTimeout;

    if (session) {
      sessionTimeout = setTimeout(() => {
        setSession(null);
      }, 120000);
    }
    
    return () => {
      clearTimeout(sessionTimeout);
    };
  }, [session]);

  const startSession = (courseName) => {
    setSession({
      id: `SESS-${Math.random().toString(36).substr(2, 9)}`,
      startTime: Date.now(),
      course: courseName
    });
    setMarkedStudents([]); // Reset student count for a new session
  };

  const endSession = () => {
    setSession(null);
  };

  const markStudentPresent = (studentData) => {
    setMarkedStudents(prev => {
      // Prevent duplicates
      if (prev.find(s => s.studentId === studentData.studentId)) return prev;
      return [...prev, studentData];
    });
  };

  return (
    <AttendanceContext.Provider value={{ 
      session, 
      startSession, 
      endSession, 
      generateStudentPayload,
      markedStudents,
      markStudentPresent 
    }}>
      {children}
    </AttendanceContext.Provider>
  );
};
