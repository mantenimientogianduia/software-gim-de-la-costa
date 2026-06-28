'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { DEV_SESSION_KEY } from '@/hooks/use-auth';
import { UserProfile } from '@/services/user.service';

const now = null; // dates stored as null — app handles null gracefully

const DEV_SESSIONS: Array<{
  role: 'admin' | 'socio' | 'profesor';
  label: string;
  description: string;
  icon: string;
  email: string;
  profile: UserProfile;
}> = [
  {
    role: 'admin',
    label: 'Administrador',
    description: 'Panel completo: finanzas, socios, clases, acceso y rutinas.',
    icon: 'admin_panel_settings',
    email: 'dev.admin@gym-test.local',
    profile: {
      email: 'dev.admin@gym-test.local',
      firstName: 'Admin',
      lastName: 'Dev',
      role: 'admin',
      status: 'active',
      dni: '00000001',
      phone: '+5491100000001',
      atGym: false,
      currentActivity: '',
      weight: 0,
      height: 0,
      gender: 'otro',
      otherSports: '',
      fitnessLevel: 'principiante',
      healthObservations: '',
      goals: '',
      weeklyTrainingGoal: 3,
      currentPlan: 'Admin',
      socialVisibility: 'hidden',
      instagram: '',
      publicBio: '',
      currentStreak: 0,
      membershipValidUntil: now,
      lastPaymentDate: now,
      createdAt: now,
      updatedAt: now,
    },
  },
  {
    role: 'socio',
    label: 'Socio',
    description: 'Vista del alumno: pagos, comprobantes, rutinas, clases.',
    icon: 'person',
    email: 'dev.socio@gym-test.local',
    profile: {
      email: 'dev.socio@gym-test.local',
      firstName: 'Juan',
      lastName: 'Socio',
      role: 'socio',
      status: 'active',
      dni: '00000002',
      phone: '+5491100000002',
      atGym: false,
      currentActivity: '',
      weight: 75,
      height: 175,
      gender: 'masculino',
      otherSports: '',
      fitnessLevel: 'intermedio',
      healthObservations: '',
      goals: 'Ganar masa muscular',
      weeklyTrainingGoal: 4,
      currentPlan: 'Mensual',
      socialVisibility: 'hidden',
      instagram: '',
      publicBio: '',
      currentStreak: 5,
      membershipValidUntil: now,
      lastPaymentDate: now,
      createdAt: now,
      updatedAt: now,
    },
  },
  {
    role: 'profesor',
    label: 'Profesor',
    description: 'Vista del instructor: clases, rutinas y asistencia.',
    icon: 'sports',
    email: 'dev.profesor@gym-test.local',
    profile: {
      email: 'dev.profesor@gym-test.local',
      firstName: 'Carlos',
      lastName: 'Profesor',
      role: 'profesor',
      status: 'active',
      dni: '00000003',
      phone: '+5491100000003',
      atGym: false,
      currentActivity: '',
      weight: 80,
      height: 180,
      gender: 'masculino',
      otherSports: '',
      fitnessLevel: 'avanzado',
      healthObservations: '',
      goals: '',
      weeklyTrainingGoal: 5,
      currentPlan: 'Instructor',
      socialVisibility: 'hidden',
      instagram: '',
      publicBio: '',
      currentStreak: 0,
      membershipValidUntil: now,
      lastPaymentDate: now,
      createdAt: now,
      updatedAt: now,
    },
  },
];

export default function DevLoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS !== 'true') {
      router.replace('/login');
    }
  }, [router]);

  if (process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS !== 'true') return null;

  const enter = (session: typeof DEV_SESSIONS[number]) => {
    sessionStorage.setItem(
      DEV_SESSION_KEY,
      JSON.stringify({ email: session.email, profile: session.profile })
    );
    router.push('/dashboard');
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 gap-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 font-label text-[10px] font-black uppercase tracking-widest">
          <span className="material-symbols-outlined text-[14px]">developer_mode</span>
          Modo desarrollo — solo para testing
        </div>
        <h1 className="font-headline font-black text-5xl uppercase tracking-tighter italic">
          Dev Login
        </h1>
        <p className="text-white/40 font-body text-sm max-w-sm">
          Elegí un rol para entrar sin Google OAuth. Los datos de Firestore son reales.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-3xl">
        {DEV_SESSIONS.map(session => (
          <button
            key={session.role}
            onClick={() => enter(session)}
            className="group text-left p-7 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/50 transition-all space-y-4"
          >
            <span className="material-symbols-outlined text-4xl text-primary group-hover:scale-110 transition-transform block">
              {session.icon}
            </span>
            <div>
              <p className="font-headline font-bold text-xl uppercase tracking-tight">{session.label}</p>
              <p className="mt-1 text-white/40 text-xs font-body leading-relaxed">{session.description}</p>
            </div>
            <p className="font-mono text-[10px] text-white/20">{session.email}</p>
          </button>
        ))}
      </div>

      <a
        href="/login"
        className="font-label text-[10px] uppercase tracking-widest text-white/20 hover:text-white/50 transition-colors"
      >
        ← Volver al login real
      </a>
    </main>
  );
}
