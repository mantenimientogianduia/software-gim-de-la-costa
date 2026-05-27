'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

import AdminDashboard from '@/components/dashboards/AdminDashboard';
import ProfesorDashboard from '@/components/dashboards/ProfesorDashboard';
import SocioDashboard from '@/components/dashboards/SocioDashboard';
import RoleSwitcher from '@/components/debug/RoleSwitcher';

type UserRole = 'admin' | 'profesor' | 'socio';

const DEV_EMAIL = 'gino.pieretti00@gmail.com';
const devToolsEnabled = process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === 'true';

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const [overrideRole, setOverrideRole] = useState<UserRole | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (!loading && profile && profile.status === 'pending' && profile.role !== 'admin' && !(devToolsEnabled && user?.email === DEV_EMAIL)) {
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

  if (!user || !profile || (profile.status === 'pending' && profile.role !== 'admin' && !(devToolsEnabled && user.email === DEV_EMAIL))) {
    return null; 
  }

  const activeRole = overrideRole || (profile.role as UserRole);
  const isDev = devToolsEnabled && user.email === DEV_EMAIL;

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
        />
      )}
      {renderDashboard()}
    </>
  );
}
