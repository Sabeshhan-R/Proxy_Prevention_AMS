'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../src/context/AuthContext';
import StudentDashboard from '../../src/components/StudentDashboard';

export default function StudentPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace('/');
    } else if (user.role !== 'student') {
      router.replace(user.role === 'teacher' ? '/teacher' : '/');
    }
  }, [user, router]);

  if (!user || user.role !== 'student') return null;

  return <StudentDashboard />;
}
