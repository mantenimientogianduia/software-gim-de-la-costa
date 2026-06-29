'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

import AdminDashboard from '@/components/dashboards/AdminDashboard';
import ProfesorDashboard from '@/components/dashboards/ProfesorDashboard';
import SocioDashboard from '@/components/dashboards/SocioDashboard';
import RoleSwitcher from '@/components/debug/RoleSwitcher';
import { canUseDevTools } from '@/lib/app-config';

type UserRole = 'admin' | 'profesor' | 'socio';

export default function DashboardPage() {
  const { user, profile, loading, isDevMode } = useAuth();
  const [overrideRole, setOverrideRole] = useState<UserRole | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (!loading && profile && profile.status === 'pending' && profile.role !== 'admin' && !canUseDevTools(user?.email)) {
      router.push('/login');
    }
  }, [user, profile, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
          <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
          <div className="absolute inset-2 rounded-full bg-primary/5 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-xl">fitness_center</span>
          </div>
        </div>
        <p className="font-label text-[10px] uppercase tracking-[0.3em] text-tertiary animate-pulse">Verificando sesión...</p>
      </div>
    );
  }

  if (!user || !profile || (profile.status === 'pending' && profile.role !== 'admin' && !canUseDevTools(user.email))) {
    return null; 
  }

  const activeRole = overrideRole || (profile.role as UserRole);
  const isDev = isDevMode || canUseDevTools(user?.email);

  const renderDashboard = () => {
    if (!profile || !user) return null;
    const dashboardProfile = { ...profile, id: user.uid, role: activeRole };

    switch (activeRole) {
      case 'admin':
        return <AdminDashboard profile={dashboardProfile} />;
      case 'profesor':
        return <ProfesorDashboard profile={dashboardProfile} />;
      default:
        return <SocioDashboard profile={dashboardProfile} />;
    }
  };

  return (
    <>
      {isDev && (
        <RoleSwitcher
          currentRole={activeRole}
          onRoleChange={setOverrideRole}
          isDevSession={isDevMode}
        />
      )}
      {renderDashboard()}
    </>
  );
}
