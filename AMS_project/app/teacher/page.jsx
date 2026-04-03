'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../src/context/AuthContext';
import TeacherDashboard from '../../src/components/TeacherDashboard';

export default function TeacherPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace('/');
    } else if (user.role !== 'teacher') {
      router.replace(user.role === 'student' ? '/student' : '/');
    }
  }, [user, router]);

  if (!user || user.role !== 'teacher') return null;

  return <TeacherDashboard />;
}
