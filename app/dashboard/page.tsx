'use client';
import { useAuth, AuthProvider } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import InstructorDashboard from '@/components/dashboards/InstructorDashboard';
import SocioDashboard from '@/components/dashboards/SocioDashboard';

function DashboardContent() {
  const { user, profile, loading, isAdmin, isInstructor, isSocio } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-8">
       <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
       <span className="font-label text-[10px] uppercase tracking-[0.5em] text-tertiary">Autenticando...</span>
    </div>
  );

  if (!user || !profile) return null;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary">
       {isAdmin && <AdminDashboard profile={profile} />}
       {isInstructor && <InstructorDashboard profile={profile} />}
       {isSocio && <SocioDashboard profile={profile} />}

       {/* Floating Exit Button for all */}
       <div className="fixed bottom-6 right-6 z-50">
          <button 
            onClick={() => {
              if(confirm('¿Cerrar sesión?')) {
                import('@/lib/firebase').then(m => m.auth.signOut()).then(() => router.push('/'));
              }
            }}
            className="p-4 bg-surface-container-low rounded-full border border-white/10 hover:bg-error/10 hover:text-error transition-all group"
          >
             <span className="material-symbols-outlined group-hover:rotate-180 transition-transform">logout</span>
          </button>
       </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}
