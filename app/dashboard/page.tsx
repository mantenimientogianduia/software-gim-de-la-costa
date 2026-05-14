'use client';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { userService, UserProfile } from '@/services/user.service';
import SocioDashboard from '@/components/dashboards/SocioDashboard';
import ProfesorDashboard from '@/components/dashboards/ProfesorDashboard';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile & { id: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userProfile = await userService.getUserProfile(user.uid);
        if (userProfile) {
          setProfile({ ...userProfile, id: user.uid });
        }
      } else {
        // Redirect to login if needed
        window.location.href = '/';
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  if (!profile) return <div className="flex items-center justify-center min-h-screen">Error al cargar perfil</div>;

  if (profile.role === 'profesor' || profile.role === 'admin') {
    return <ProfesorDashboard profile={profile} />;
  }

  return <SocioDashboard profile={profile} />;
}
