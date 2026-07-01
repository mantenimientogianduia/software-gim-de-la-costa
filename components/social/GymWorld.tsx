'use client';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PublicGymPresence, socialService } from '@/services/social.service';
import AvatarSprite, { AvatarConfig, DEFAULT_AVATAR } from './AvatarSprite';

// Slot positions in the isometric room (pixel coords in the 600x360 canvas)
const AVATAR_SLOTS = [
  { x: 90,  y: 170 },
  { x: 160, y: 195 },
  { x: 235, y: 220 },
  { x: 310, y: 190 },
  { x: 380, y: 160 },
  { x: 450, y: 185 },
  { x: 520, y: 210 },
  { x: 185, y: 140 },
  { x: 340, y: 130 },
  { x: 475, y: 145 },
];

interface ExtendedPresence extends PublicGymPresence {
  avatarConfig?: Partial<AvatarConfig>;
}

function ProfilePanel({ profile, onClose }: { profile: ExtendedPresence; onClose: () => void }) {
  const cfg: AvatarConfig = { ...DEFAULT_AVATAR, ...profile.avatarConfig };
  const isAnon = profile.socialVisibility === 'anonymous';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-end md:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <button className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-label="Cerrar" />
      <motion.div
        initial={{ scale: 0.92, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 24 }}
        className="relative w-full max-w-sm bg-surface-container-low rounded-2xl ghost-border p-6 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 rounded bg-surface-container-high flex items-center justify-center"
          aria-label="Cerrar"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>

        <div className="flex flex-col items-center gap-3 pt-2">
          <AvatarSprite config={cfg} size={72} isAnonymous={isAnon} />
          <div className="text-center">
            <p className="font-label text-[9px] uppercase tracking-[0.25em] text-primary font-black mb-1">Entrenando ahora</p>
            <h3 className="font-headline text-2xl font-black uppercase tracking-tight">{profile.displayName}</h3>
            {profile.instagram && (
              <p className="font-label text-[10px] uppercase tracking-widest text-primary mt-1">{profile.instagram}</p>
            )}
          </div>
        </div>

        {profile.publicBio && (
          <p className="mt-5 text-sm text-tertiary leading-relaxed text-center">{profile.publicBio}</p>
        )}

        {typeof profile.currentStreak === 'number' && profile.currentStreak > 0 && (
          <div className="mt-5 bg-surface-container-high rounded-xl p-4 flex items-center gap-4">
            <span className="material-symbols-outlined text-3xl text-primary">local_fire_department</span>
            <div>
              <p className="font-label text-[10px] uppercase tracking-widest text-tertiary">Racha actual</p>
              <p className="font-headline text-3xl font-black text-primary">{profile.currentStreak} días</p>
            </div>
          </div>
        )}

        {isAnon && (
          <p className="mt-5 text-sm text-tertiary italic text-center">Este socio eligió entrenar de forma anónima.</p>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function GymWorld() {
  const [profiles, setProfiles] = useState<ExtendedPresence[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ExtendedPresence | null>(null);

  useEffect(() => {
    const unsub = socialService.getPublicGymPresence((data) => {
      setProfiles(data as ExtendedPresence[]);
      setLoading(false);
    });
    return unsub;
  }, []);

  const isEmpty = !loading && profiles.length === 0;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-headline text-3xl font-black uppercase tracking-tight">Comunidad en el gym</h2>
          <p className="mt-1 text-sm text-tertiary">
            {loading ? 'Conectando...' : profiles.length === 0 ? 'Nadie visible ahora mismo.' : `${profiles.length} socio${profiles.length !== 1 ? 's' : ''} entrenando ahora`}
          </p>
        </div>
        {profiles.length > 0 && (
          <div className="flex items-center gap-1.5 font-label text-[9px] uppercase tracking-widest text-primary shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            En vivo
          </div>
        )}
      </div>

      {/* Isometric Room */}
      <div className="relative w-full overflow-hidden rounded-2xl ghost-border bg-[#0d1117] select-none" style={{ minHeight: 340 }}>
        {/* Room SVG background */}
        <svg
          viewBox="0 0 600 360"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
          style={{ display: 'block', maxHeight: 400 }}
        >
          <defs>
            <linearGradient id="floorGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1a1f2e" />
              <stop offset="100%" stopColor="#131720" />
            </linearGradient>
            <linearGradient id="wallGradL" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1e2535" />
              <stop offset="100%" stopColor="#252d42" />
            </linearGradient>
            <linearGradient id="wallGradR" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#171c28" />
              <stop offset="100%" stopColor="#1a2030" />
            </linearGradient>
            <linearGradient id="accentGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f9cf9" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#4f9cf9" stopOpacity="0" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Left wall */}
          <polygon points="0,80 0,360 300,360 300,270" fill="url(#wallGradL)" />
          {/* Right wall */}
          <polygon points="600,80 600,360 300,360 300,270" fill="url(#wallGradR)" />
          {/* Floor */}
          <polygon points="0,80 300,270 600,80 300,-110" fill="url(#floorGrad)" />

          {/* Floor grid lines */}
          {[-2,-1,0,1,2,3,4].map(i => (
            <line key={`gl${i}`}
              x1={0} y1={80 + i * 38.5}
              x2={600} y2={80 + i * 38.5}
              stroke="#ffffff" strokeOpacity={0.03} strokeWidth={1}
            />
          ))}
          {[0,1,2,3,4,5,6,7,8].map(i => (
            <line key={`gv${i}`}
              x1={i * 75} y1={0}
              x2={i * 75} y2={360}
              stroke="#ffffff" strokeOpacity={0.02} strokeWidth={1}
            />
          ))}

          {/* Ceiling accent light strip */}
          <rect x="150" y="10" width="300" height="6" rx="3" fill="url(#accentGlow)" />
          <rect x="200" y="10" width="200" height="3" rx="1.5" fill="#4f9cf9" opacity={0.5} />

          {/* Left wall windows / mirrors */}
          <rect x="20" y="100" width="100" height="130" rx="4" fill="#0f1829" stroke="#2a3650" strokeWidth="1.5" />
          <rect x="24" y="104" width="92" height="122" rx="2" fill="#1a2540" opacity={0.7} />
          {/* mirror reflection shimmer */}
          <rect x="28" y="108" width="12" height="114" rx="2" fill="white" opacity={0.04} />
          <text x="70" y="230" textAnchor="middle" fontSize="9" fill="#4f9cf9" fontFamily="monospace" opacity={0.6}>ESPEJO</text>

          <rect x="140" y="95" width="85" height="120" rx="4" fill="#0f1829" stroke="#2a3650" strokeWidth="1.5" />
          <rect x="144" y="99" width="77" height="112" rx="2" fill="#1a2540" opacity={0.7} />
          <rect x="148" y="103" width="10" height="104" rx="2" fill="white" opacity={0.04} />

          {/* Right wall equipment silhouettes */}
          {/* Treadmill 1 */}
          <rect x="430" y="160" width="70" height="30" rx="4" fill="#1e2535" stroke="#2d3a55" strokeWidth="1" />
          <rect x="445" y="145" width="40" height="18" rx="3" fill="#252d42" stroke="#3d4f72" strokeWidth="1" />
          <rect x="448" y="147" width="34" height="14" rx="2" fill="#0d1117" />
          <rect x="451" y="150" width="12" height="8" rx="1" fill="#4f9cf9" opacity={0.4} />
          <ellipse cx="435" cy="190" rx="5" ry="3" fill="#333" />
          <ellipse cx="495" cy="190" rx="5" ry="3" fill="#333" />
          <text x="465" y="193" textAnchor="middle" fontSize="7" fill="#4f9cf9" opacity={0.5} fontFamily="monospace">CINTA</text>

          {/* Treadmill 2 */}
          <rect x="515" y="145" width="70" height="30" rx="4" fill="#1e2535" stroke="#2d3a55" strokeWidth="1" />
          <rect x="530" y="130" width="40" height="18" rx="3" fill="#252d42" stroke="#3d4f72" strokeWidth="1" />
          <rect x="533" y="132" width="34" height="14" rx="2" fill="#0d1117" />
          <rect x="536" y="135" width="12" height="8" rx="1" fill="#4f9cf9" opacity={0.4} />

          {/* Weights rack right */}
          <rect x="490" y="85" width="10" height="65" rx="2" fill="#2d3a55" />
          <rect x="503" y="85" width="10" height="65" rx="2" fill="#2d3a55" />
          {[90,103,116,129,142].map((y, i) => (
            <ellipse key={i} cx="501" cy={y} rx="14" ry="5" fill={i % 2 === 0 ? '#333' : '#3a3a3a'} />
          ))}

          {/* Bench press center */}
          <rect x="250" y="230" width="100" height="20" rx="5" fill="#1e2535" stroke="#2d3a55" strokeWidth="1" />
          <rect x="255" y="222" width="90" height="10" rx="3" fill="#252d42" />
          <rect x="270" y="215" width="8" height="30" rx="2" fill="#2d3a55" />
          <rect x="322" y="215" width="8" height="30" rx="2" fill="#2d3a55" />
          <rect x="262" y="213" width="76" height="6" rx="2" fill="#3d4f72" />
          {/* Barbell weights */}
          <ellipse cx="263" cy="216" rx="10" ry="4" fill="#444" />
          <ellipse cx="337" cy="216" rx="10" ry="4" fill="#444" />

          {/* Dumbbells on floor left */}
          <ellipse cx="90" cy="255" rx="8" ry="4" fill="#2d3a55" />
          <rect x="82" y="253" width="16" height="4" rx="1" fill="#252d42" />
          <ellipse cx="115" cy="258" rx="7" ry="3.5" fill="#2d3a55" />
          <rect x="108" y="256" width="14" height="4" rx="1" fill="#252d42" />

          {/* Neon "GYM" sign on back wall */}
          <text x="300" y="60" textAnchor="middle" fontSize="28" fontWeight="bold" fontFamily="monospace"
            fill="none" stroke="#4f9cf9" strokeWidth="1.5" opacity={0.6} filter="url(#glow)">
            GYM
          </text>

          {/* Floor mat */}
          <ellipse cx="300" cy="300" rx="130" ry="28" fill="#1a2035" stroke="#253050" strokeWidth="1" opacity={0.5} />
          <text x="300" y="305" textAnchor="middle" fontSize="8" fill="#3d5080" fontFamily="sans-serif" letterSpacing="4">· · · · ·</text>
        </svg>

        {/* Avatars overlaid on top of the SVG */}
        {!loading && profiles.map((profile, idx) => {
          const slot = AVATAR_SLOTS[idx % AVATAR_SLOTS.length];
          const cfg: AvatarConfig = { ...DEFAULT_AVATAR, ...profile.avatarConfig };
          const isAnon = profile.socialVisibility === 'anonymous';
          const isSelected = selected?.id === profile.id;

          return (
            <motion.button
              key={profile.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ delay: idx * 0.08, type: 'spring', stiffness: 260, damping: 20 }}
              onClick={() => setSelected(isSelected ? null : profile)}
              className="absolute focus:outline-none group"
              style={{
                left: `${(slot.x / 600) * 100}%`,
                top: `${(slot.y / 360) * 100}%`,
                transform: 'translate(-50%, -100%)',
                zIndex: 10 + idx,
              }}
              aria-label={`Ver perfil de ${profile.displayName}`}
            >
              {/* Name bubble above avatar */}
              <div className={`mb-1 px-2 py-0.5 rounded-full text-[9px] font-label font-black uppercase tracking-wide transition-all duration-150 text-center whitespace-nowrap
                ${isSelected
                  ? 'bg-primary text-on-primary shadow-glow'
                  : 'bg-black/60 text-white group-hover:bg-primary/80 group-hover:text-white'
                }`}
              >
                {isAnon ? '???' : profile.displayName.split(' ')[0]}
              </div>
              <div className="flex justify-center">
                <AvatarSprite
                  config={cfg}
                  size={40}
                  isAnonymous={isAnon}
                  isSelected={isSelected}
                />
              </div>
              {/* Shadow under avatar */}
              <div className="mx-auto mt-0.5 w-8 h-1.5 rounded-full bg-black/40 blur-sm" />
            </motion.button>
          );
        })}

        {/* Empty state overlay */}
        {isEmpty && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/30 backdrop-blur-[1px]">
            <span className="material-symbols-outlined text-5xl text-primary/30">groups</span>
            <p className="font-headline font-black text-lg uppercase tracking-tight text-on-surface/40">Nadie entrenando visible</p>
            <p className="font-label text-[10px] uppercase tracking-widest text-tertiary/50 max-w-[220px] text-center">
              Los socios con visibilidad activada aparecerán aquí cuando estén en el gym.
            </p>
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Mini member list below the room */}
      {profiles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {profiles.map((profile) => {
            const cfg: AvatarConfig = { ...DEFAULT_AVATAR, ...profile.avatarConfig };
            const isAnon = profile.socialVisibility === 'anonymous';
            const isSelected = selected?.id === profile.id;
            return (
              <button
                key={profile.id}
                onClick={() => setSelected(isSelected ? null : profile)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all text-sm font-label font-black uppercase tracking-wide
                  ${isSelected
                    ? 'bg-primary text-on-primary shadow-glow'
                    : 'bg-surface-container-low ghost-border hover:bg-surface-container-high text-on-surface'
                  }`}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: isAnon ? '#888' : cfg.outfitColor }}
                />
                <span className="text-[10px]">{isAnon ? 'Socio anónimo' : profile.displayName}</span>
                {typeof profile.currentStreak === 'number' && profile.currentStreak > 0 && (
                  <span className="text-[8px] opacity-60">🔥{profile.currentStreak}</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Profile panel */}
      <AnimatePresence>
        {selected && <ProfilePanel profile={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}
