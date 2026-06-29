'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { userService } from '@/services/user.service';
import { DEV_SESSION_KEY } from '@/hooks/use-auth';

const DEV_PASSWORD = '1234';

const DEV_USERS: Record<string, { label: string; icon: string; email: string; role: 'admin' | 'socio' | 'profesor' }> = {
  admin: {
    label: 'Administrador',
    icon: 'admin_panel_settings',
    email: 'dev.admin@gym-test.local',
    role: 'admin',
  },
  socio: {
    label: 'Socio',
    icon: 'person',
    email: 'dev.socio@gym-test.local',
    role: 'socio',
  },
  profe: {
    label: 'Profesor',
    icon: 'sports',
    email: 'dev.profesor@gym-test.local',
    role: 'profesor',
  },
};

const DEV_PROFILES: Record<string, object> = {
  admin: {
    email: 'dev.admin@gym-test.local', firstName: 'Admin', lastName: 'Dev',
    role: 'admin', status: 'active', dni: '00000001', phone: '', atGym: false,
    currentActivity: '', weight: 0, height: 0, gender: 'otro', otherSports: '',
    fitnessLevel: 'principiante', healthObservations: '', goals: '',
    weeklyTrainingGoal: 3, currentPlan: 'Admin', socialVisibility: 'hidden',
    instagram: '', publicBio: '', currentStreak: 0,
    membershipValidUntil: null, lastPaymentDate: null, createdAt: null, updatedAt: null,
  },
  socio: {
    email: 'dev.socio@gym-test.local', firstName: 'Juan', lastName: 'Socio',
    role: 'socio', status: 'active', dni: '00000002', phone: '', atGym: false,
    currentActivity: '', weight: 75, height: 175, gender: 'masculino', otherSports: '',
    fitnessLevel: 'intermedio', healthObservations: '', goals: 'Ganar masa muscular',
    weeklyTrainingGoal: 4, currentPlan: 'Mensual', socialVisibility: 'hidden',
    instagram: '', publicBio: '', currentStreak: 5,
    membershipValidUntil: null, lastPaymentDate: null, createdAt: null, updatedAt: null,
  },
  profe: {
    email: 'dev.profesor@gym-test.local', firstName: 'Carlos', lastName: 'Coach',
    role: 'profesor', status: 'active', dni: '00000003', phone: '', atGym: false,
    currentActivity: '', weight: 80, height: 180, gender: 'masculino', otherSports: '',
    fitnessLevel: 'avanzado', healthObservations: '', goals: '',
    weeklyTrainingGoal: 5, currentPlan: 'Instructor', socialVisibility: 'hidden',
    instagram: '', publicBio: '', currentStreak: 0,
    membershipValidUntil: null, lastPaymentDate: null, createdAt: null, updatedAt: null,
  },
};

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [needsDni, setNeedsDni] = useState(false);
  const [pendingUser, setPendingUser] = useState<any>(null);
  const [dniInput, setDniInput] = useState('');

  // Dev login state
  const [showDev, setShowDev] = useState(false);
  const [devUser, setDevUser] = useState('admin');
  const [devPass, setDevPass] = useState('');
  const [devError, setDevError] = useState('');

  const handleGoogleLogin = async () => {
    setError('');
    setIsPending(false);
    setLoading(true);
    let requiresDni = false;
    try {
      const { user } = await authService.loginWithGoogle();
      const profile = await userService.getUserProfile(user.uid);

      if (!profile) {
        setPendingUser(user);
        setNeedsDni(true);
        requiresDni = true;
      } else if (profile.status === 'pending' && profile.role !== 'admin') {
        setIsPending(true);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión con Google');
    } finally {
      if (!requiresDni) setLoading(false);
    }
  };

  const handleCompleteRegistration = async () => {
    if (!dniInput || !pendingUser) return;
    setLoading(true);
    try {
      const nameParts = pendingUser.displayName?.split(' ') || ['Nuevo', 'Socio'];
      await userService.createUserProfile(
        pendingUser.uid,
        pendingUser.email || '',
        nameParts[0],
        nameParts.slice(1).join(' '),
        'socio',
        dniInput
      );
      setNeedsDni(false);
      setIsPending(true);
    } catch (err: any) {
      setError(err.message || 'Error al completar registro');
    } finally {
      setLoading(false);
    }
  };

  const handleDevLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setDevError('');
    const user = DEV_USERS[devUser];
    if (!user) { setDevError('Usuario inválido.'); return; }
    if (devPass !== DEV_PASSWORD) { setDevError('Contraseña incorrecta.'); return; }

    sessionStorage.setItem(
      DEV_SESSION_KEY,
      JSON.stringify({ email: user.email, profile: DEV_PROFILES[devUser] })
    );
    router.push('/dashboard');
  };

  return (
    <main className="min-h-screen flex flex-col lg:flex-row w-full overflow-hidden bg-surface text-on-surface">
      {/* Left panel — hero image */}
      <div className="relative w-full lg:w-1/2 h-[265px] lg:h-screen flex flex-col justify-end p-8 lg:p-16 bg-black">
        <img
          className="absolute inset-0 w-full h-full object-cover object-center grayscale brightness-[0.5] contrast-[1.1] opacity-70"
          src="https://picsum.photos/seed/industrial-gym-floor/1080/1920"
          alt="Industrial gym interior"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-black/70 lg:to-black" />
        <div className="relative z-10">
          <h1 className="font-headline font-black text-primary-container tracking-tighter uppercase text-5xl lg:text-[6rem] leading-[0.85] drop-shadow-2xl">
            GYM<br />DE LA<br />COSTA
          </h1>
        </div>
      </div>

      {/* Right panel — forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-surface z-10 relative">
        <div className="w-full max-w-md space-y-10">
          <div className="space-y-4">
            <h2 className="font-headline font-bold text-on-surface text-4xl sm:text-5xl tracking-tight leading-none">
              Acceso Exclusivo
            </h2>
            <p className="font-body text-tertiary text-lg">
              El portal para el entrenamiento de alto rendimiento.
            </p>
          </div>

          {/* Error global */}
          {error && (
            <div className="text-error bg-error/10 p-4 rounded-sm ghost-border text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">warning</span> {error}
            </div>
          )}

          {/* Pending approval */}
          {isPending && (
            <div className="bg-primary/5 p-8 rounded-sm ghost-border space-y-4 border-l-4 border-l-primary animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-3 text-primary-container">
                <span className="material-symbols-outlined">verified_user</span>
                <h3 className="font-headline font-bold uppercase tracking-tight">Cuenta en Revisión</h3>
              </div>
              <p className="font-body text-on-surface/80 text-sm leading-relaxed">
                Tu solicitud ha sido recibida. Por seguridad, un administrador debe confirmar tu identidad antes de habilitar tu acceso al dashboard.
              </p>
              <p className="font-label text-[10px] text-tertiary uppercase tracking-widest pt-2">
                Te notificaremos vía email cuando estés aprobado.
              </p>
              <button
                onClick={() => setIsPending(false)}
                className="w-full font-label text-xs text-tertiary uppercase tracking-widest hover:text-primary transition-colors py-2"
              >
                Volver al inicio
              </button>
            </div>
          )}

          {/* Google login */}
          {!isPending && !needsDni && (
            <div className="space-y-6">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full h-20 flex items-center justify-center gap-6 bg-surface-container-high text-on-surface font-label text-base md:text-lg uppercase tracking-[0.2em] px-8 rounded-sm ghost-border hover:bg-surface-container-highest transition-all duration-300 disabled:opacity-50 overflow-hidden group relative"
              >
                <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6 z-10" />
                <span className="z-10 font-bold">{loading ? 'Procesando...' : 'Entrar con Google'}</span>
              </button>
              <div className="text-center font-label text-[10px] text-tertiary uppercase tracking-[0.2em] opacity-50">
                Sistema de autenticación segura vía Google OAuth
              </div>

              {/* Dev access toggle */}
              <div className="pt-4 border-t border-outline-variant/10">
                <button
                  type="button"
                  onClick={() => { setShowDev(v => !v); setDevError(''); }}
                  className="w-full flex items-center justify-center gap-2 font-label text-[10px] uppercase tracking-widest text-yellow-500/60 hover:text-yellow-400 transition-colors py-2"
                >
                  <span className="material-symbols-outlined text-sm">developer_mode</span>
                  {showDev ? 'Ocultar acceso dev' : '⚡ Acceso Developer'}
                </button>

                {showDev && (
                  <form
                    onSubmit={handleDevLogin}
                    className="mt-4 space-y-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-6 animate-in fade-in slide-in-from-top-2 duration-300"
                  >
                    <p className="font-label text-[9px] uppercase tracking-widest text-yellow-500/60 text-center">
                      Solo para desarrollo — no usar en producción real
                    </p>

                    {/* Role selector */}
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(DEV_USERS).map(([key, u]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setDevUser(key)}
                          className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg border text-center transition-all ${
                            devUser === key
                              ? 'bg-yellow-500/20 border-yellow-500/60 text-yellow-300'
                              : 'bg-surface-container-high border-outline-variant/20 text-tertiary hover:border-yellow-500/30'
                          }`}
                        >
                          <span className="material-symbols-outlined text-xl">{u.icon}</span>
                          <span className="font-label text-[9px] uppercase tracking-widest font-bold">{u.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Password */}
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-yellow-500/50 text-sm">lock</span>
                      <input
                        type="password"
                        placeholder="Contraseña dev"
                        value={devPass}
                        onChange={e => { setDevPass(e.target.value); setDevError(''); }}
                        className="w-full bg-surface-container-high pl-12 pr-4 py-3 rounded-lg outline-none font-mono text-sm border border-outline-variant/20 focus:border-yellow-500/50 transition-all"
                        autoComplete="off"
                      />
                    </div>

                    {devError && (
                      <p className="text-error text-xs font-label uppercase tracking-widest text-center">{devError}</p>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/40 text-yellow-300 font-label text-[10px] font-black uppercase tracking-widest py-3 rounded-lg transition-all"
                    >
                      Ingresar como {DEV_USERS[devUser]?.label}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* DNI registration */}
          {!isPending && needsDni && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h3 className="font-headline font-bold text-xl uppercase tracking-tight">Casi listo</h3>
                <p className="text-tertiary text-sm italic">Ingresa tu DNI para habilitar tu acceso al gimnasio.</p>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary">badge</span>
                <input
                  type="text"
                  value={dniInput}
                  onChange={e => setDniInput(e.target.value)}
                  placeholder="DNI SIN PUNTOS"
                  className="w-full bg-surface-container-high pl-12 pr-4 py-4 rounded-sm outline-none font-headline font-bold text-xl border border-outline-variant/20 focus:border-primary transition-all"
                  autoFocus
                />
              </div>
              <button
                onClick={handleCompleteRegistration}
                disabled={!dniInput || loading}
                className="w-full bg-primary text-on-primary font-label text-sm font-bold uppercase tracking-widest py-4 rounded-sm shadow-glow hover:scale-[1.02] transition-all disabled:opacity-50"
              >
                Confirmar y Finalizar
              </button>
              <button
                onClick={() => setNeedsDni(false)}
                className="w-full text-tertiary font-label text-[10px] uppercase tracking-widest"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
