'use client';
import { useAuth, AuthProvider } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function LandingContent() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && profile) {
      router.push('/dashboard');
    }
  }, [user, profile, loading, router]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error(err);
      alert('Error al iniciar sesión con Google');
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-black text-white px-6">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-tertiary/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-4xl text-center relative z-10">
        <motion.div
           initial={{ opacity: 0, y: 40 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="inline-block px-4 py-1.5 bg-surface-container-high rounded-full font-label text-[10px] uppercase tracking-[0.4em] mb-8 border border-white/10 text-primary">Estándar de Elite</span>
          <h1 className="font-headline text-7xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85] mb-8 italic">
            GIMNASIO <br/>
            <span className="text-primary italic">DE LA COSTA</span>
          </h1>
          <p className="font-body text-lg md:text-2xl text-tertiary max-w-2xl mx-auto mb-12 uppercase tracking-tight font-light leading-relaxed">
            Gestión Premium de Entrenamiento, Clases en Vivo y Nutrición. <br className="hidden md:block" />
            Lleva tu rendimiento al siguiente nivel.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <button 
              onClick={handleLogin}
              className="group relative px-10 py-5 bg-gradient-primary rounded-2xl overflow-hidden shadow-glow hover:scale-105 transition-all duration-300 active:scale-95"
            >
               <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
               <span className="relative z-10 font-headline text-lg font-black uppercase tracking-widest flex items-center gap-3">
                  <span className="material-symbols-outlined">login</span>
                  Ingresar al Sistema
               </span>
            </button>
            
            <a 
              href="#info" 
              className="px-10 py-5 font-label text-xs uppercase tracking-widest hover:text-primary transition-colors border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md"
            >
              Ver Planes
            </a>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-10 left-10 flex gap-12 font-mono text-[10px] uppercase tracking-widest text-tertiary/40">
        <span>EST. 2026</span>
        <span>LATAM - ARG</span>
        <span>ELITE ATHLETICS</span>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <LandingContent />
    </AuthProvider>
  );
}
