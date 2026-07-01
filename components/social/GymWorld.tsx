'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PublicGymPresence, socialService } from '@/services/social.service';
import AvatarSprite, { AvatarConfig, DEFAULT_AVATAR } from './AvatarSprite';

interface ExtendedPresence extends PublicGymPresence {
  avatarConfig?: Partial<AvatarConfig>;
}

// ── Isometric coordinate math ────────────────────────────────────────────────
// Near corner (viewer) at screen (400, 420).
// Each "left" unit  → screen (-38, -16)
// Each "right" unit → screen (+38, -16)
// Each "up" unit    → screen (  0, -40)
const OX = 400, OY = 420;
const DLx = -38, DLy = -16;
const DRx =  38, DRy = -16;
const DZy = -40;

function bx(l: number, r: number) { return Math.round(OX + l * DLx + r * DRx); }
function by(l: number, r: number, z = 0) { return Math.round(OY + l * DLy + r * DRy + z * DZy); }
function p(l: number, r: number, z = 0) { return `${bx(l, r)},${by(l, r, z)}`; }
function P(...pts: [number, number, number?][]) { return pts.map(([l, r, z = 0]) => p(l, r, z)).join(' '); }

// Avatar floor slots (l, r) — front-center area, away from equipment
const AVATAR_SLOTS: [number, number][] = [
  [1, 1], [2, 1], [1, 2], [2, 2], [3, 2],
  [2, 3], [1, 3], [3, 3], [4, 2], [2, 4],
];

// ── 3-face isometric box ──────────────────────────────────────────────────────
function IsoBox({ l, r, lw, rw, h, top, left, right, stroke = '#0005', sw = 0.8 }: {
  l: number; r: number; lw: number; rw: number; h: number;
  top: string; left: string; right: string; stroke?: string; sw?: number;
}) {
  return (
    <g>
      <polygon points={P([l,r],[l+lw,r],[l+lw,r,h],[l,r,h])}     fill={left}  stroke={stroke} strokeWidth={sw} />
      <polygon points={P([l,r],[l,r+rw],[l,r+rw,h],[l,r,h])}     fill={right} stroke={stroke} strokeWidth={sw} />
      <polygon points={P([l,r,h],[l+lw,r,h],[l+lw,r+rw,h],[l,r+rw,h])} fill={top} stroke={stroke} strokeWidth={sw} />
    </g>
  );
}

// ── Profile panel ─────────────────────────────────────────────────────────────
function ProfilePanel({ profile, onClose }: { profile: ExtendedPresence; onClose: () => void }) {
  const cfg: AvatarConfig = { ...DEFAULT_AVATAR, ...profile.avatarConfig };
  const isAnon = profile.socialVisibility === 'anonymous';
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-end md:items-center justify-center p-4" role="dialog" aria-modal="true">
      <button className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.92, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 24 }}
        className="relative w-full max-w-sm bg-surface-container-low rounded-2xl ghost-border p-6 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 h-8 w-8 rounded bg-surface-container-high flex items-center justify-center">
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
        <div className="flex flex-col items-center gap-3 pt-2">
          <AvatarSprite config={cfg} size={72} isAnonymous={isAnon} />
          <div className="text-center">
            <p className="font-label text-[9px] uppercase tracking-[0.25em] text-primary font-black mb-1">Entrenando ahora</p>
            <h3 className="font-headline text-2xl font-black uppercase tracking-tight">{profile.displayName}</h3>
            {profile.instagram && <p className="font-label text-[10px] uppercase tracking-widest text-primary mt-1">{profile.instagram}</p>}
          </div>
        </div>
        {profile.publicBio && <p className="mt-5 text-sm text-tertiary leading-relaxed text-center">{profile.publicBio}</p>}
        {typeof profile.currentStreak === 'number' && profile.currentStreak > 0 && (
          <div className="mt-5 bg-surface-container-high rounded-xl p-4 flex items-center gap-4">
            <span className="material-symbols-outlined text-3xl text-primary">local_fire_department</span>
            <div>
              <p className="font-label text-[10px] uppercase tracking-widest text-tertiary">Racha actual</p>
              <p className="font-headline text-3xl font-black text-primary">{profile.currentStreak} días</p>
            </div>
          </div>
        )}
        {isAnon && <p className="mt-5 text-sm text-tertiary italic text-center">Este socio eligió entrenar de forma anónima.</p>}
      </motion.div>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
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

  // Sort back-to-front so front avatars render on top
  const sortedAvatars = profiles
    .map((profile, idx) => ({ profile, slot: AVATAR_SLOTS[idx % AVATAR_SLOTS.length] }))
    .sort((a, b) => (b.slot[0] + b.slot[1]) - (a.slot[0] + a.slot[1]));

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-headline text-3xl font-black uppercase tracking-tight">Comunidad en el gym</h2>
          <p className="mt-1 text-sm text-tertiary">
            {loading ? 'Conectando...' : profiles.length === 0
              ? 'Nadie visible ahora mismo.'
              : `${profiles.length} socio${profiles.length !== 1 ? 's' : ''} entrenando ahora`}
          </p>
        </div>
        {profiles.length > 0 && (
          <div className="flex items-center gap-1.5 font-label text-[9px] uppercase tracking-widest text-primary shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />En vivo
          </div>
        )}
      </div>

      {/* Isometric room */}
      <div className="relative w-full overflow-hidden rounded-2xl" style={{ background: '#0c1018', minHeight: 340 }}>
        <svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto block" style={{ maxHeight: 480 }}>
          <defs>
            <linearGradient id="lgFloor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e2738" />
              <stop offset="100%" stopColor="#131a26" />
            </linearGradient>
            <linearGradient id="lgLeft" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3a4f68" />
              <stop offset="100%" stopColor="#4a6080" />
            </linearGradient>
            <linearGradient id="lgRight" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#2e4258" />
              <stop offset="100%" stopColor="#3a5268" />
            </linearGradient>
            <linearGradient id="lgCeil" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#252f40" />
              <stop offset="100%" stopColor="#1a2230" />
            </linearGradient>
            <filter id="fGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="fShadow">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* ── FLOOR ───────────────────────────────────────── */}
          <polygon points={P([0,0],[7,0],[7,7],[0,7])} fill="url(#lgFloor)" />

          {/* floor grid – left-direction lines (const r) */}
          {[0,1,2,3,4,5,6,7].map(r => (
            <line key={`fl${r}`} x1={bx(0,r)} y1={by(0,r)} x2={bx(7,r)} y2={by(7,r)}
              stroke="#263040" strokeWidth="0.8" />
          ))}
          {/* floor grid – right-direction lines (const l) */}
          {[0,1,2,3,4,5,6,7].map(l => (
            <line key={`fr${l}`} x1={bx(l,0)} y1={by(l,0)} x2={bx(l,7)} y2={by(l,7)}
              stroke="#263040" strokeWidth="0.8" />
          ))}

          {/* ── LEFT WALL ────────────────────────────────────── */}
          <polygon points={P([0,0],[7,0],[7,0,4],[0,0,4])} fill="url(#lgLeft)" />

          {/* left wall horizontal mortar lines */}
          {[1,2,3,4].map(z => (
            <line key={`lh${z}`} x1={bx(0,0)} y1={by(0,0,z)} x2={bx(7,0)} y2={by(7,0,z)}
              stroke="#2d3f58" strokeWidth="0.8" />
          ))}
          {/* left wall vertical lines (every 2 l-units) */}
          {[0,1,2,3,4,5,6,7].map(l => (
            <line key={`lv${l}`} x1={bx(l,0)} y1={by(l,0,0)} x2={bx(l,0)} y2={by(l,0,4)}
              stroke="#2d3f58" strokeWidth="0.6" />
          ))}

          {/* Mirror panels on left wall (surface at r=0, varying l and z) */}
          {/* Mirror 1 */}
          <polygon points={`${bx(0.5,0)},${by(0.5,0,0.7)} ${bx(2.5,0)},${by(2.5,0,0.7)} ${bx(2.5,0)},${by(2.5,0,3.5)} ${bx(0.5,0)},${by(0.5,0,3.5)}`}
            fill="#5a7a9a" opacity="0.7" stroke="#7aa0c0" strokeWidth="1.5" />
          <polygon points={`${bx(0.6,0)},${by(0.6,0,0.8)} ${bx(0.9,0)},${by(0.9,0,0.8)} ${bx(0.9,0)},${by(0.9,0,3.4)} ${bx(0.6,0)},${by(0.6,0,3.4)}`}
            fill="white" opacity="0.08" />
          {/* Mirror 2 */}
          <polygon points={`${bx(3,0)},${by(3,0,0.7)} ${bx(5,0)},${by(5,0,0.7)} ${bx(5,0)},${by(5,0,3.5)} ${bx(3,0)},${by(3,0,3.5)}`}
            fill="#5a7a9a" opacity="0.7" stroke="#7aa0c0" strokeWidth="1.5" />
          <polygon points={`${bx(3.1,0)},${by(3.1,0,0.8)} ${bx(3.4,0)},${by(3.4,0,0.8)} ${bx(3.4,0)},${by(3.4,0,3.4)} ${bx(3.1,0)},${by(3.1,0,3.4)}`}
            fill="white" opacity="0.08" />
          {/* Mirror 3 */}
          <polygon points={`${bx(5.5,0)},${by(5.5,0,0.7)} ${bx(6.8,0)},${by(6.8,0,0.7)} ${bx(6.8,0)},${by(6.8,0,3.5)} ${bx(5.5,0)},${by(5.5,0,3.5)}`}
            fill="#5a7a9a" opacity="0.7" stroke="#7aa0c0" strokeWidth="1.5" />

          {/* ── RIGHT WALL ───────────────────────────────────── */}
          <polygon points={P([0,0],[0,7],[0,7,4],[0,0,4])} fill="url(#lgRight)" />

          {/* right wall grid */}
          {[1,2,3,4].map(z => (
            <line key={`rh${z}`} x1={bx(0,0)} y1={by(0,0,z)} x2={bx(0,7)} y2={by(0,7,z)}
              stroke="#243650" strokeWidth="0.8" />
          ))}
          {[0,1,2,3,4,5,6,7].map(r => (
            <line key={`rv${r}`} x1={bx(0,r)} y1={by(0,r,0)} x2={bx(0,r)} y2={by(0,r,4)}
              stroke="#243650" strokeWidth="0.6" />
          ))}

          {/* Dumbbell rack silhouette on right wall */}
          {/* Horizontal bars */}
          {[1.2, 2.0, 2.8].map((z, i) => (
            <line key={`dbar${i}`}
              x1={bx(0,1)} y1={by(0,1,z)} x2={bx(0,6)} y2={by(0,6,z)}
              stroke="#8090a8" strokeWidth="2.5" />
          ))}
          {/* Dumbbell circles (pairs) */}
          {[1.5, 2.5, 3.5, 4.5, 5.5].map((r, ri) => (
            [1.2, 2.0, 2.8].map((z, zi) => {
              const cx = bx(0, r);
              const cy = by(0, r, z);
              const colors = ['#c0392b','#e67e22','#27ae60','#2980b9','#8e44ad'];
              return (
                <g key={`d${ri}${zi}`}>
                  <ellipse cx={cx} cy={cy} rx={6} ry={4} fill={colors[ri]} opacity={0.85} />
                  <ellipse cx={cx} cy={cy} rx={3} ry={2} fill={colors[ri]} opacity={0.5} />
                </g>
              );
            })
          ))}

          {/* ── CEILING EDGE ─────────────────────────────────── */}
          <polygon points={P([0,0,4],[7,0,4],[7,7,4],[0,7,4])} fill="url(#lgCeil)" opacity="0.6" />
          {/* Ceiling edge lines */}
          <line x1={bx(0,0)} y1={by(0,0,4)} x2={bx(7,0)} y2={by(7,0,4)} stroke="#5a7090" strokeWidth="1.5" />
          <line x1={bx(0,0)} y1={by(0,0,4)} x2={bx(0,7)} y2={by(0,7,4)} stroke="#4a6080" strokeWidth="1.5" />

          {/* Neon light strip on ceiling */}
          <line x1={bx(1,1)} y1={by(1,1,3.95)} x2={bx(1,6)} y2={by(1,6,3.95)}
            stroke="#4dabf7" strokeWidth="3" opacity="0.5" filter="url(#fGlow)" />
          <line x1={bx(6,1)} y1={by(6,1,3.95)} x2={bx(6,6)} y2={by(6,6,3.95)}
            stroke="#4dabf7" strokeWidth="3" opacity="0.5" filter="url(#fGlow)" />

          {/* GYM neon sign on ceiling */}
          <text x={bx(4,4)} y={by(4,4,3.8)} textAnchor="middle"
            fontSize="18" fontWeight="bold" fontFamily="monospace" letterSpacing="6"
            fill="#4dabf7" opacity="0.9" filter="url(#fGlow)">
            GYM
          </text>

          {/* ── EQUIPMENT (back → front) ─────────────────────── */}

          {/* Squat rack frame  l=5-7, r=4-6, h=3.8 */}
          {/* Back posts */}
          <IsoBox l={6.7} r={4.1} lw={0.25} rw={0.25} h={3.8} top="#7a8a9a" left="#5a6a7a" right="#4a5a6a" />
          <IsoBox l={6.7} r={5.7} lw={0.25} rw={0.25} h={3.8} top="#7a8a9a" left="#5a6a7a" right="#4a5a6a" />
          {/* Front posts */}
          <IsoBox l={5.1} r={4.1} lw={0.25} rw={0.25} h={3.8} top="#7a8a9a" left="#5a6a7a" right="#4a5a6a" />
          <IsoBox l={5.1} r={5.7} lw={0.25} rw={0.25} h={3.8} top="#7a8a9a" left="#5a6a7a" right="#4a5a6a" />
          {/* Top crossbars */}
          <IsoBox l={5.1} r={4.1} lw={1.85} rw={0.15} h={3.95} top="#8a9aaa" left="#6a7a8a" right="#5a6a7a" />
          <IsoBox l={5.1} r={5.7} lw={1.85} rw={0.15} h={3.95} top="#8a9aaa" left="#6a7a8a" right="#5a6a7a" />
          {/* Barbell */}
          <IsoBox l={5.5} r={3.8} lw={1.0} rw={2.4} h={2.5} top="#aabbcc" left="#8090a0" right="#607080" />
          {/* Weight plates on barbell */}
          <IsoBox l={5.5} r={3.8} lw={0.12} rw={0.5} h={2.9} top="#c0392b" left="#922b21" right="#6e1f18" />
          <IsoBox l={6.3} r={3.8} lw={0.12} rw={0.5} h={2.9} top="#c0392b" left="#922b21" right="#6e1f18" />
          <IsoBox l={5.5} r={5.7} lw={0.12} rw={0.5} h={2.9} top="#c0392b" left="#922b21" right="#6e1f18" />
          <IsoBox l={6.3} r={5.7} lw={0.12} rw={0.5} h={2.9} top="#c0392b" left="#922b21" right="#6e1f18" />

          {/* Dumbbell rack against left wall: l=6-7, r=0.5-5, h=1.5 */}
          <IsoBox l={6} r={0.5} lw={1} rw={4.5} h={1.5} top="#8090a0" left="#607080" right="#506070" />
          {/* Dumbbell shapes on rack top */}
          {[0.8, 1.6, 2.4, 3.2, 4.0].map((r, i) => {
            const colors = ['#c0392b','#e67e22','#27ae60','#2980b9','#8e44ad'];
            return (
              <g key={`rack${i}`}>
                <ellipse cx={bx(6.5, r)} cy={by(6.5, r, 1.6)} rx={10} ry={5} fill={colors[i]} opacity={0.9} />
                <ellipse cx={bx(6.5, r)} cy={by(6.5, r, 1.6)} rx={4}  ry={2} fill={colors[i]} opacity={0.5} />
              </g>
            );
          })}

          {/* Cable machine: l=4.5-6, r=1-3, h=3 */}
          <IsoBox l={4.5} r={1} lw={1.5} rw={2} h={3} top="#6a7a8a" left="#4a5a6a" right="#3a4a5a" />
          {/* Cable machine screen */}
          <polygon
            points={`${bx(4.6,1)},${by(4.6,1,2.2)} ${bx(5.7,1)},${by(5.7,1,2.2)} ${bx(5.7,1)},${by(5.7,1,2.8)} ${bx(4.6,1)},${by(4.6,1,2.8)}`}
            fill="#1a3a5c" stroke="#4dabf7" strokeWidth="0.8" />
          <polygon
            points={`${bx(4.65,1)},${by(4.65,1,2.3)} ${bx(5.65,1)},${by(5.65,1,2.3)} ${bx(5.65,1)},${by(5.65,1,2.75)} ${bx(4.65,1)},${by(4.65,1,2.75)}`}
            fill="#0d2040" opacity="0.8" />
          <line x1={bx(4.9,1)} y1={by(4.9,1,2.45)} x2={bx(5.4,1)} y2={by(5.4,1,2.45)}
            stroke="#4dabf7" strokeWidth="1" opacity="0.6" />
          <line x1={bx(4.9,1)} y1={by(4.9,1,2.6)} x2={bx(5.2,1)} y2={by(5.2,1,2.6)}
            stroke="#4dabf7" strokeWidth="1" opacity="0.4" />

          {/* Weight stack on cable machine */}
          {[0,1,2,3,4,5].map(i => (
            <IsoBox key={i} l={4.7+i*0.001} r={2.8} lw={0.4} rw={0.15} h={0.2+i*0.32}
              top="#8090a0" left="#607080" right="#506070" />
          ))}

          {/* Bench press: l=3-4.5, r=3-5, h=0.8 */}
          {/* Bench legs */}
          <IsoBox l={3.1} r={3.1} lw={0.2} rw={0.2} h={0.7} top="#505a6a" left="#404858" right="#303848" />
          <IsoBox l={4.2} r={3.1} lw={0.2} rw={0.2} h={0.7} top="#505a6a" left="#404858" right="#303848" />
          <IsoBox l={3.1} r={4.7} lw={0.2} rw={0.2} h={0.7} top="#505a6a" left="#404858" right="#303848" />
          <IsoBox l={4.2} r={4.7} lw={0.2} rw={0.2} h={0.7} top="#505a6a" left="#404858" right="#303848" />
          {/* Bench pad */}
          <IsoBox l={3} r={3} lw={1.5} rw={2} h={0.85} top="#1a3060" left="#122248" right="#0e1a38" />
          {/* Bench pad highlight */}
          <polygon
            points={P([3,3,0.85],[3.5,3,0.85],[3.5,5,0.85],[3,5,0.85])}
            fill="white" opacity="0.05" />
          {/* Barbell stand */}
          <IsoBox l={3.5} r={3} lw={0.15} rw={0.1} h={1.5} top="#8090a0" left="#607080" right="#506070" />
          <IsoBox l={4.0} r={3} lw={0.15} rw={0.1} h={1.5} top="#8090a0" left="#607080" right="#506070" />
          {/* Barbell */}
          <IsoBox l={3.4} r={2.8} lw={1.2} rw={2.4} h={1.6} top="#b0c0d0" left="#8090a0" right="#607080" />
          {/* Weight plates */}
          <IsoBox l={3.4} r={2.8} lw={0.1} rw={0.4} h={1.85} top="#e67e22" left="#ca6f1e" right="#9a5319" />
          <IsoBox l={4.5} r={2.8} lw={0.1} rw={0.4} h={1.85} top="#e67e22" left="#ca6f1e" right="#9a5319" />
          <IsoBox l={3.4} r={4.8} lw={0.1} rw={0.4} h={1.85} top="#e67e22" left="#ca6f1e" right="#9a5319" />
          <IsoBox l={4.5} r={4.8} lw={0.1} rw={0.4} h={1.85} top="#e67e22" left="#ca6f1e" right="#9a5319" />

          {/* Treadmill: l=0.5-2, r=5-7, h=1.2 */}
          <IsoBox l={0.5} r={5} lw={1.5} rw={2} h={1.3} top="#404a5a" left="#303848" right="#202838" />
          {/* Treadmill belt */}
          <polygon points={P([0.6,5.1,1.31],[1.9,5.1,1.31],[1.9,6.9,1.31],[0.6,6.9,1.31])}
            fill="#1a2030" stroke="#303848" strokeWidth="0.5" />
          {/* Treadmill handlebar */}
          <IsoBox l={0.6} r={5} lw={0.15} rw={0.1} h={2.4} top="#8090a0" left="#607080" right="#506070" />
          <IsoBox l={1.8} r={5} lw={0.15} rw={0.1} h={2.4} top="#8090a0" left="#607080" right="#506070" />
          <IsoBox l={0.6} r={5} lw={1.35} rw={0.1} h={2.4} top="#8090a0" left="#607080" right="#506070" />
          {/* Screen */}
          <polygon points={`${bx(0.9,5)},${by(0.9,5,2.2)} ${bx(1.6,5)},${by(1.6,5,2.2)} ${bx(1.6,5)},${by(1.6,5,2.35)} ${bx(0.9,5)},${by(0.9,5,2.35)}`}
            fill="#1a3a5c" stroke="#4dabf7" strokeWidth="0.8" />

          {/* Water cooler: l=6.5-7, r=6-7, h=2 */}
          <IsoBox l={6.5} r={6} lw={0.5} rw={1} h={2} top="#29b6f6" left="#0288d1" right="#0277bd" />
          {/* Water bottle on top */}
          <IsoBox l={6.65} r={6.25} lw={0.2} rw={0.5} h={2.7} top="#4fc3f7" left="#29b6f6" right="#0288d1" />

          {/* Rubber floor mat in center */}
          <polygon points={P([1,1],[5,1],[5,5],[1,5])} fill="#1a2234" opacity="0.6"
            stroke="#252f42" strokeWidth="0.8" />
          {/* Mat logo */}
          <text x={bx(3,3)} y={by(3,3)} textAnchor="middle" fontSize="9"
            fontFamily="monospace" fill="#2a3850" letterSpacing="3">· · ·</text>

          {/* ── AVATARS (sorted back→front) ──────────────────── */}
          {!loading && sortedAvatars.map(({ profile, slot }, idx) => {
            const [sl, sr] = slot;
            const ax = bx(sl, sr);
            const ay = by(sl, sr, 0);
            const cfg: AvatarConfig = { ...DEFAULT_AVATAR, ...profile.avatarConfig };
            const isAnon = profile.socialVisibility === 'anonymous';
            const isSelected = selected?.id === profile.id;

            // Avatar shadow
            return (
              <g key={profile.id}>
                <ellipse cx={ax} cy={ay} rx={16} ry={6} fill="black" opacity={0.35} />
                <foreignObject
                  x={ax - 30} y={ay - 82}
                  width={60} height={90}
                  style={{ overflow: 'visible', cursor: 'pointer' }}
                  onClick={() => setSelected(isSelected ? null : profile)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {/* Name tag */}
                    <div style={{
                      background: isSelected ? '#4dabf7' : 'rgba(0,0,0,0.72)',
                      color: isSelected ? '#000' : '#fff',
                      padding: '1px 7px',
                      borderRadius: 99,
                      fontSize: 9,
                      fontWeight: 900,
                      fontFamily: 'monospace',
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                      marginBottom: 3,
                      boxShadow: isSelected ? '0 0 8px #4dabf7' : undefined,
                    }}>
                      {isAnon ? '???' : profile.displayName.split(' ')[0]}
                    </div>
                    <AvatarSprite config={cfg} size={44} isAnonymous={isAnon} isSelected={isSelected} />
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>

        {/* Empty state */}
        {isEmpty && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/40 backdrop-blur-[1px]">
            <span className="material-symbols-outlined text-5xl text-primary/30">groups</span>
            <p className="font-headline font-black text-lg uppercase tracking-tight text-on-surface/40">Nadie entrenando visible</p>
            <p className="font-label text-[10px] uppercase tracking-widest text-tertiary/50 max-w-[220px] text-center">
              Los socios con visibilidad activada aparecerán aquí cuando estén en el gym.
            </p>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Member chips */}
      {profiles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {profiles.map((profile, idx) => {
            const cfg: AvatarConfig = { ...DEFAULT_AVATAR, ...profile.avatarConfig };
            const isAnon = profile.socialVisibility === 'anonymous';
            const isSelected = selected?.id === profile.id;
            return (
              <button key={profile.id}
                onClick={() => setSelected(isSelected ? null : profile)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all
                  ${isSelected
                    ? 'bg-primary text-on-primary shadow-glow'
                    : 'bg-surface-container-low ghost-border hover:bg-surface-container-high text-on-surface'
                  }`}
              >
                <div className="w-2 h-2 rounded-full" style={{ background: isAnon ? '#888' : cfg.outfitColor }} />
                <span className="font-label text-[10px] font-black uppercase tracking-wide">
                  {isAnon ? 'Socio anónimo' : profile.displayName}
                </span>
                {typeof profile.currentStreak === 'number' && profile.currentStreak > 0 && (
                  <span className="text-[8px] opacity-60">🔥{profile.currentStreak}</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {selected && <ProfilePanel profile={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}
