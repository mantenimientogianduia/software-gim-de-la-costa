'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { userService } from '@/services/user.service';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleGoogleLogin = async () => {
    setError('');
    setIsPending(false);
    setLoading(true);
    try {
      const { user, isNewUser } = await authService.loginWithGoogle();
      const isAdminEmail = user.email === 'gino.pieretti00@gmail.com';
      
      let profile = await userService.getUserProfile(user.uid);
      
      if (!profile) {
        // Create basic profile for Google users if missing
        const nameParts = user.displayName?.split(' ') || ['Admin', 'Costa'];
        await userService.createUserProfile(
          user.uid,
          user.email || '',
          nameParts[0],
          nameParts.slice(1).join(' '),
          isAdminEmail ? 'admin' : 'socio'
        );
        
        // Re-fetch or update local state
        if (isAdminEmail) {
          router.push('/dashboard');
        } else {
          setIsPending(true);
        }
      } else {
        // Update user to admin if they are the bootstrapped admin but don't have the role yet
        if (isAdminEmail && profile.role !== 'admin') {
          profile.role = 'admin';
          profile.status = 'active';
          // Optionally update Firestore here, but for now we just allow entry
        }

        if (profile.status === 'pending' && profile.role !== 'admin') {
          setIsPending(true);
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión con Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col lg:flex-row w-full overflow-hidden bg-surface text-on-surface">
      <div className="relative w-full lg:w-1/2 h-[265px] lg:h-screen flex flex-col justify-end p-8 lg:p-16 bg-black">
        <img 
          className="absolute inset-0 w-full h-full object-cover object-center grayscale brightness-[0.5] contrast-[1.1] opacity-70" 
          src="https://picsum.photos/seed/industrial-gym-floor/1080/1920" 
          alt="Industrial gym interior" 
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-black/70 lg:to-black"></div>
        <div className="relative z-10">
          <h1 className="font-headline font-black text-primary-container tracking-tighter uppercase text-5xl lg:text-[6rem] leading-[0.85] drop-shadow-2xl">
            GYM<br/>DE LA<br/>COSTA
          </h1>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-surface z-10 relative">
        <div className="w-full max-w-md space-y-12">
          <div className="space-y-4">
            <h2 className="font-headline font-bold text-on-surface text-4xl sm:text-5xl tracking-tight leading-none">
              Acceso Exclusivo
            </h2>
            <p className="font-body text-tertiary text-lg">
              El portal para el entrenamiento de alto rendimiento.
            </p>
          </div>

          <div className="space-y-8">
            {error && <div className="text-error bg-error/10 p-4 rounded-sm ghost-border text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">warning</span> {error}
            </div>}

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
              </div>
            )}

            {!isPending && (
              <div className="space-y-6">
                <button 
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full h-20 flex items-center justify-center gap-6 bg-surface-container-high text-on-surface font-label text-base md:text-lg uppercase tracking-[0.2em] px-8 rounded-sm ghost-border hover:bg-surface-container-highest transition-all duration-300 disabled:opacity-50 overflow-hidden group relative"
                >
                  <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6 z-10" />
                  <span className="z-10 font-bold">{loading ? 'Procesando...' : 'Entrar con Google'}</span>
                </button>
                <div className="text-center font-label text-[10px] text-tertiary uppercase tracking-[0.2em] opacity-50">
                  Sistema de autenticación segura vía Google OAuth
                </div>
              </div>
            )}

            {isPending && (
              <button 
                onClick={() => setIsPending(false)}
                className="w-full font-label text-xs text-tertiary uppercase tracking-widest hover:text-primary transition-colors py-2"
              >
                Volver al inicio
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
