'use client';

import { AuthProvider } from '../src/context/AuthContext';
import { AttendanceProvider } from '../src/context/AttendanceContext';

export function Providers({ children }) {
  return (
    <AuthProvider>
      <AttendanceProvider>
        {children}
      </AttendanceProvider>
    </AuthProvider>
  );
}
