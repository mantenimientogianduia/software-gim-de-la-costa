'use client';
import { useEffect, useState } from 'react';
import { PublicGymPresence, socialService } from '@/services/social.service';

export default function GymPresence() {
  const [profiles, setProfiles] = useState<PublicGymPresence[]>([]);
  const [selected, setSelected] = useState<PublicGymPresence | null>(null);

  useEffect(() => {
    return socialService.getPublicGymPresence(setProfiles);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="font-headline text-3xl font-black uppercase tracking-tight">Comunidad en el gym</h2>
        <p className="mt-2 text-sm text-tertiary">Socios que eligieron aparecer mientras entrenan ahora.</p>
      </div>

      {profiles.length === 0 ? (
        <div className="bg-surface-container-low rounded-2xl ghost-border py-24 text-center opacity-60">
          <span className="material-symbols-outlined text-5xl mb-4">groups</span>
          <p className="font-label text-xs uppercase tracking-widest">No hay socios visibles en este momento</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {profiles.map(profile => (
            <button
              key={profile.id}
              onClick={() => setSelected(profile)}
              className="text-left bg-surface-container-low p-6 rounded-2xl ghost-border hover:bg-surface-container-high transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-headline font-black uppercase">
                  {profile.socialVisibility === 'anonymous' ? '?' : profile.displayName.charAt(0)}
                </div>
                <span className="font-label text-[9px] uppercase tracking-widest text-primary">Entrenando ahora</span>
              </div>
              <h3 className="mt-5 font-headline text-xl font-black uppercase tracking-tight">{profile.displayName}</h3>
              {profile.instagram && <p className="mt-1 font-label text-[10px] uppercase tracking-widest text-primary">{profile.instagram}</p>}
              {profile.publicBio && <p className="mt-3 text-sm text-tertiary line-clamp-2">{profile.publicBio}</p>}
              {profile.currentStreak !== undefined && (
                <p className="mt-4 font-label text-[10px] uppercase tracking-widest text-tertiary">
                  Racha: <span className="text-on-surface font-black">{profile.currentStreak} dias</span>
                </p>
              )}
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-[90] flex items-end md:items-center justify-center p-4" role="dialog" aria-modal="true">
          <button className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelected(null)} aria-label="Cerrar perfil" />
          <div className="relative w-full max-w-lg bg-surface-container-low rounded-2xl ghost-border p-6 shadow-2xl">
            <div className="flex justify-between gap-4">
              <div>
                <p className="font-label text-[10px] uppercase tracking-[0.25em] text-primary font-black">Perfil publico</p>
                <h3 className="mt-2 font-headline text-3xl font-black uppercase tracking-tight">{selected.displayName}</h3>
                {selected.instagram && <p className="mt-1 font-label text-[10px] uppercase tracking-widest text-primary">{selected.instagram}</p>}
              </div>
              <button onClick={() => setSelected(null)} className="h-10 w-10 rounded bg-surface-container-high flex items-center justify-center" aria-label="Cerrar">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {selected.publicBio && <p className="mt-6 text-sm text-tertiary leading-relaxed">{selected.publicBio}</p>}
            {selected.currentStreak !== undefined && (
              <div className="mt-6 bg-surface-container-high rounded-xl p-4">
                <p className="font-label text-[10px] uppercase tracking-widest text-tertiary">Racha</p>
                <p className="font-headline text-2xl font-black text-primary">{selected.currentStreak} dias</p>
              </div>
            )}
            {selected.socialVisibility === 'anonymous' && (
              <p className="mt-6 text-sm text-tertiary">Este socio eligio entrenar de forma anonima.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
