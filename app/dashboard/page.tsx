'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

import AdminDashboard from '@/components/dashboards/AdminDashboard';
import ProfesorDashboard from '@/components/dashboards/ProfesorDashboard';
import SocioDashboard from '@/components/dashboards/SocioDashboard';

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (!loading && profile && profile.status === 'pending' && profile.role !== 'admin') {
      router.push('/login');
    }
  }, [user, profile, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
         <div className="font-label text-primary font-bold uppercase tracking-widest animate-pulse">CARGANDO...</div>
      </div>
    );
  }

  if (!user || !profile || (profile.status === 'pending' && profile.role !== 'admin')) {
    return null; // Redirects via useEffect
  }

  if (profile.role === 'admin') {
    return <AdminDashboard profile={profile} />;
  }

  if (profile.role === 'profesor') {
    return <ProfesorDashboard profile={profile} />;
  }

  return <SocioDashboard profile={profile} />;
}
