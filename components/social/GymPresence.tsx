'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PublicGymPresence, socialService } from '@/services/social.service';

export default function GymPresence() {
  const [profiles, setProfiles] = useState<PublicGymPresence[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PublicGymPresence | null>(null);

  useEffect(() => {
    const unsub = socialService.getPublicGymPresence((data) => {
      setProfiles(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="font-headline text-3xl font-black uppercase tracking-tight">Comunidad en el gym</h2>
        <p className="mt-2 text-sm text-tertiary">Socios que eligieron aparecer mientras entrenan ahora.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface-container-low p-6 rounded-2xl ghost-border animate-pulse">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="w-12 h-12 rounded-xl bg-surface-container-high" />
                <div className="w-24 h-4 rounded bg-surface-container-high" />
              </div>
              <div className="w-32 h-5 rounded bg-surface-container-high mb-2" />
              <div className="w-full h-3 rounded bg-surface-container-high mb-1" />
              <div className="w-3/4 h-3 rounded bg-surface-container-high" />
            </div>
          ))}
        </div>
      ) : profiles.length === 0 ? (
        <div className="bg-surface-container-low rounded-2xl ghost-border py-20 text-center">
          <span className="material-symbols-outlined text-5xl mb-4 text-tertiary opacity-30">groups</span>
          <p className="font-headline font-black text-lg uppercase tracking-tight mb-2 opacity-40">Nadie entrenando visible</p>
          <p className="font-label text-xs uppercase tracking-widest text-tertiary opacity-40 max-w-xs mx-auto">
            Los socios que activen su visibilidad en su perfil aparecerán aquí mientras estén en el gym.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {profiles.map((profile, idx) => (
            <motion.button
              key={profile.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              onClick={() => setSelected(profile)}
              className="text-left bg-surface-container-low p-6 rounded-2xl ghost-border hover:bg-surface-container-high transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-headline font-black text-xl uppercase group-hover:bg-primary/25 transition-colors">
                  {profile.socialVisibility === 'anonymous' ? '?' : profile.displayName.charAt(0)}
                </div>
                <div className="flex items-center gap-1.5 font-label text-[9px] uppercase tracking-widest text-primary">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Entrenando ahora
                </div>
              </div>
              <h3 className="mt-5 font-headline text-xl font-black uppercase tracking-tight">{profile.displayName}</h3>
              {profile.instagram && (
                <p className="mt-1 font-label text-[10px] uppercase tracking-widest text-primary">{profile.instagram}</p>
              )}
              {profile.publicBio && (
                <p className="mt-3 text-sm text-tertiary line-clamp-2">{profile.publicBio}</p>
              )}
              {profile.currentStreak !== undefined && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-primary">local_fire_department</span>
                  <p className="font-label text-[10px] uppercase tracking-widest text-tertiary">
                    Racha: <span className="text-on-surface font-black">{profile.currentStreak} días</span>
                  </p>
                </div>
              )}
            </motion.button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-end md:items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
          >
            <button className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelected(null)} aria-label="Cerrar perfil" />
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-surface-container-low rounded-2xl ghost-border p-6 shadow-2xl"
            >
              <div className="flex justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/15 text-primary flex items-center justify-center font-headline font-black text-2xl uppercase">
                    {selected.socialVisibility === 'anonymous' ? '?' : selected.displayName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-label text-[10px] uppercase tracking-[0.25em] text-primary font-black">Perfil público</p>
                    <h3 className="font-headline text-2xl font-black uppercase tracking-tight">{selected.displayName}</h3>
                    {selected.instagram && (
                      <p className="font-label text-[10px] uppercase tracking-widest text-primary">{selected.instagram}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="h-10 w-10 rounded bg-surface-container-high flex items-center justify-center shrink-0"
                  aria-label="Cerrar"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {selected.publicBio && (
                <p className="mt-6 text-sm text-tertiary leading-relaxed">{selected.publicBio}</p>
              )}

              {selected.currentStreak !== undefined && (
                <div className="mt-6 bg-surface-container-high rounded-xl p-4 flex items-center gap-4">
                  <span className="material-symbols-outlined text-3xl text-primary">local_fire_department</span>
                  <div>
                    <p className="font-label text-[10px] uppercase tracking-widest text-tertiary">Racha actual</p>
                    <p className="font-headline text-3xl font-black text-primary">{selected.currentStreak} días</p>
                  </div>
                </div>
              )}

              {selected.socialVisibility === 'anonymous' && (
                <p className="mt-6 text-sm text-tertiary italic">Este socio eligió entrenar de forma anónima.</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
