'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PublicGymPresence, socialService } from '@/services/social.service';
import AvatarSprite, { AvatarConfig, DEFAULT_AVATAR } from './AvatarSprite';

interface ExtendedPresence extends PublicGymPresence {
  avatarConfig?: Partial<AvatarConfig>;
  checkedInAt?: { toDate?: () => Date } | string | null;
}

// Colores de slot — garantizan variedad visual aunque todos tengan el mismo avatar
const SLOT_COLORS = ['#00d8ff', '#f06020', '#00cc88', '#c060ff', '#f0c000', '#ff4060'];

// ── Helpers ───────────────────────────────────────────────────────────────────

function useNow() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function fmtElapsed(ts: ExtendedPresence['checkedInAt'], now: number): string {
  if (!ts) return '';
  try {
    const d = typeof ts === 'object' && ts?.toDate ? ts.toDate() : new Date(ts as string);
    const mins = Math.max(0, Math.floor((now - d.getTime()) / 60_000));
    if (mins < 1)  return 'recién';
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60), m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  } catch { return ''; }
}

// ── Tarjeta de miembro ────────────────────────────────────────────────────────

interface CardProps {
  profile: ExtendedPresence;
  now: number;
  slotIndex: number;
  isSelected: boolean;
  onClick: () => void;
}

function MemberCard({ profile, now, slotIndex, isSelected, onClick }: CardProps) {
  const cfg: AvatarConfig    = { ...DEFAULT_AVATAR, ...profile.avatarConfig };
  const isAnon               = profile.socialVisibility === 'anonymous';
  const accent               = SLOT_COLORS[slotIndex % SLOT_COLORS.length];
  const elapsed              = fmtElapsed(profile.checkedInAt, now);
  const streak               = typeof profile.currentStreak === 'number' ? profile.currentStreak : null;
  const rank                 = slotIndex + 1;

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.28, delay: slotIndex * 0.06 }}
      onClick={onClick}
      className="focus:outline-none text-left"
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: isSelected
          ? `linear-gradient(175deg, #101828 0%, #0d1a2e 60%, ${accent}12 100%)`
          : `linear-gradient(175deg, #0c1520 0%, #08101c 100%)`,
        border: `2px solid ${isSelected ? accent : '#1c2a3c'}`,
        boxShadow: isSelected
          ? `0 0 0 1px ${accent}25, 0 16px 48px ${accent}14, inset 0 0 60px ${accent}06`
          : `inset 0 1px 0 #ffffff06, 0 4px 12px #00000040`,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        width: '100%',
      }}
      aria-label={`Ver perfil de ${profile.displayName}`}
    >
      {/* ── Tira superior de color ── */}
      <div style={{
        height: 5, flexShrink: 0,
        background: `linear-gradient(90deg, ${accent} 0%, ${accent}88 100%)`,
        boxShadow: `0 0 14px ${accent}70, 0 2px 6px ${accent}40`,
      }} />

      {/* ── Número de posición (decorativo) ── */}
      <div style={{
        position: 'absolute', top: 14, left: 12,
        fontFamily: 'monospace', fontSize: 9, fontWeight: 700,
        color: accent, letterSpacing: 1, opacity: 0.7,
      }}>
        #{rank.toString().padStart(2, '0')}
      </div>

      {/* ── Badge LIVE ── */}
      <div style={{
        position: 'absolute', top: 14, right: 12,
        display: 'flex', alignItems: 'center', gap: 4,
        fontFamily: 'monospace', fontSize: 7, fontWeight: 700,
        color: '#00cc88', textTransform: 'uppercase', letterSpacing: 2,
      }}>
        <span style={{
          width: 5, height: 5, borderRadius: '50%', background: '#00cc88',
          display: 'inline-block',
          animation: 'gymLivePulse 1.8s ease-in-out infinite',
        }} />
        LIVE
      </div>

      {/* ── Avatar con halo ── */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        paddingTop: 28, paddingBottom: 0, gap: 0,
      }}>
        {/* Círculo de fondo */}
        <div style={{
          width: 112, height: 112,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accent}22 0%, ${accent}08 55%, transparent 75%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: isSelected ? `0 0 32px ${accent}35, inset 0 0 20px ${accent}10` : 'none',
          transition: 'box-shadow 0.2s',
          position: 'relative',
        }}>
          {/* Ring exterior */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: `1.5px solid ${accent}30`,
          }} />
          <AvatarSprite config={cfg} size={80} isAnonymous={isAnon} isSelected={isSelected} />
        </div>
      </div>

      {/* ── Nombre ── */}
      <div style={{ padding: '14px 14px 0', textAlign: 'center' }}>
        <p className="font-headline" style={{
          fontSize: 15, fontWeight: 900,
          color: isSelected ? '#ffffff' : '#d8eaf8',
          textTransform: 'uppercase', letterSpacing: 1,
          lineHeight: 1.2, wordBreak: 'break-word',
        }}>
          {isAnon ? '??? ANÓNIMO' : profile.displayName}
        </p>
        {!isAnon && profile.instagram && (
          <p style={{
            fontFamily: 'monospace', fontSize: 9,
            color: accent, marginTop: 3, letterSpacing: 1, opacity: 0.85,
          }}>
            {profile.instagram}
          </p>
        )}
      </div>

      {/* ── Stats bar ── */}
      <div style={{
        margin: '14px 14px 0',
        borderTop: `1px solid ${accent}20`,
        paddingTop: 12,
        display: 'flex',
        justifyContent: 'center',
        gap: 20,
        paddingBottom: 16,
      }}>
        {elapsed && (
          <div style={{ textAlign: 'center' }}>
            <p style={{
              fontFamily: 'monospace', fontSize: 18, fontWeight: 900,
              color: accent, lineHeight: 1,
              textShadow: `0 0 12px ${accent}60`,
            }}>
              {elapsed}
            </p>
            <p style={{
              fontFamily: 'monospace', fontSize: 6, color: '#2a4060',
              textTransform: 'uppercase', letterSpacing: 2, marginTop: 4,
            }}>
              EN GYM
            </p>
          </div>
        )}
        {streak !== null && streak > 0 && (
          <div style={{ textAlign: 'center' }}>
            <p style={{
              fontFamily: 'monospace', fontSize: 18, fontWeight: 900,
              color: '#f06020', lineHeight: 1,
              textShadow: '0 0 10px #f0602060',
            }}>
              🔥{streak}
            </p>
            <p style={{
              fontFamily: 'monospace', fontSize: 6, color: '#2a4060',
              textTransform: 'uppercase', letterSpacing: 2, marginTop: 4,
            }}>
              RACHA
            </p>
          </div>
        )}
        {!elapsed && streak === null && (
          <p style={{
            fontFamily: 'monospace', fontSize: 8, color: '#2a3a50',
            textTransform: 'uppercase', letterSpacing: 2,
          }}>
            ENTRENANDO
          </p>
        )}
      </div>

      {/* ── Bio ── */}
      {!isAnon && profile.publicBio && (
        <p style={{
          fontFamily: 'monospace', fontSize: 8, color: '#3a5270',
          lineHeight: 1.7, textAlign: 'center',
          padding: '0 14px 14px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        } as React.CSSProperties}>
          {profile.publicBio}
        </p>
      )}
    </motion.button>
  );
}

// ── Modal de perfil ───────────────────────────────────────────────────────────

function ProfileModal({ profile, now, slotIndex, onClose }: {
  profile: ExtendedPresence;
  now: number;
  slotIndex: number;
  onClose: () => void;
}) {
  const cfg    = { ...DEFAULT_AVATAR, ...profile.avatarConfig } as AvatarConfig;
  const isAnon = profile.socialVisibility === 'anonymous';
  const accent = SLOT_COLORS[slotIndex % SLOT_COLORS.length];
  const elapsed = fmtElapsed(profile.checkedInAt, now);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-end md:items-center justify-center p-4"
      role="dialog" aria-modal="true"
    >
      <button className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.9, y: 28 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 28 }}
        transition={{ type: 'spring', damping: 22, stiffness: 280 }}
        className="relative w-full max-w-xs overflow-hidden"
        style={{
          background: `linear-gradient(160deg, #0f1e30 0%, #08101e 80%, ${accent}0a 100%)`,
          border: `2px solid ${accent}`,
          boxShadow: `4px 4px 0 ${accent}40, 0 24px 80px #00000090`,
          fontFamily: 'monospace',
        }}
      >
        <div style={{ height: 5, background: accent, boxShadow: `0 0 20px ${accent}` }} />
        <button onClick={onClose} style={{
          position: 'absolute', top: 13, right: 13,
          width: 28, height: 28, border: `1px solid ${accent}`,
          color: accent, background: 'transparent',
          fontFamily: 'monospace', fontSize: 15, fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>×</button>

        <div style={{ padding: '20px 24px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          {/* Avatar */}
          <div style={{
            width: 130, height: 130, borderRadius: '50%',
            background: `radial-gradient(circle, ${accent}28 0%, transparent 70%)`,
            border: `2px solid ${accent}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 32px ${accent}30`,
          }}>
            <AvatarSprite config={cfg} size={96} isAnonymous={isAnon} />
          </div>

          {/* Nombre */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 8, color: '#00cc88', letterSpacing: 3, textTransform: 'uppercase', fontWeight: 700, marginBottom: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#00cc88', display: 'inline-block', animation: 'gymLivePulse 1.8s infinite' }} />
              ENTRENANDO AHORA
            </p>
            <h3 className="font-headline" style={{ fontSize: 22, fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: 1.5 }}>
              {isAnon ? 'ANÓNIMO' : profile.displayName}
            </h3>
            {!isAnon && profile.instagram && (
              <p style={{ fontSize: 10, color: accent, marginTop: 4, letterSpacing: 1 }}>{profile.instagram}</p>
            )}
          </div>

          {/* Stats */}
          {(elapsed || (typeof profile.currentStreak === 'number' && profile.currentStreak > 0)) && (
            <div style={{
              display: 'flex', width: '100%',
              borderTop: `1px solid ${accent}30`, borderBottom: `1px solid ${accent}20`,
              paddingTop: 14, paddingBottom: 14,
            }}>
              {elapsed && (
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <p style={{ fontSize: 30, fontWeight: 900, color: accent, lineHeight: 1, textShadow: `0 0 20px ${accent}60` }}>{elapsed}</p>
                  <p style={{ fontSize: 7, color: '#3a5070', textTransform: 'uppercase', letterSpacing: 2, marginTop: 5 }}>EN GYM HOY</p>
                </div>
              )}
              {typeof profile.currentStreak === 'number' && profile.currentStreak > 0 && (
                <div style={{ flex: 1, textAlign: 'center', borderLeft: elapsed ? `1px solid #1a2840` : 'none' }}>
                  <p style={{ fontSize: 30, fontWeight: 900, color: '#f06020', lineHeight: 1 }}>🔥{profile.currentStreak}</p>
                  <p style={{ fontSize: 7, color: '#3a5070', textTransform: 'uppercase', letterSpacing: 2, marginTop: 5 }}>DÍAS DE RACHA</p>
                </div>
              )}
            </div>
          )}

          {!isAnon && profile.publicBio && (
            <p style={{ fontSize: 10, color: '#5070a0', lineHeight: 1.8, textAlign: 'center' }}>{profile.publicBio}</p>
          )}
          {isAnon && (
            <p style={{ fontSize: 10, color: '#3a5070', fontStyle: 'italic', textAlign: 'center' }}>
              Este socio prefiere mantenerse anónimo.
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function GymWorld() {
  const [profiles, setProfiles] = useState<ExtendedPresence[]>([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState<ExtendedPresence | null>(null);
  const now = useNow();

  useEffect(() => {
    const unsub = socialService.getPublicGymPresence(data => {
      setProfiles(data as ExtendedPresence[]);
      setLoading(false);
    });
    return unsub;
  }, []);

  const isEmpty = !loading && profiles.length === 0;

  const withStreak = [...profiles]
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => typeof p.currentStreak === 'number' && p.currentStreak > 0)
    .sort((a, b) => (b.p.currentStreak ?? 0) - (a.p.currentStreak ?? 0));

  const maxStreak = withStreak[0]?.p.currentStreak ?? 1;

  // Grid: 1 col si hay 1, 2 cols si hay 2-4, más si hay más
  const gridCols = profiles.length === 1 ? 1 : profiles.length <= 4 ? Math.min(profiles.length, 4) : 4;

  return (
    <>
      <style>{`
        @keyframes gymLivePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.3; transform: scale(0.7); }
        }
      `}</style>

      <div className="space-y-3 animate-in fade-in duration-500">

        {/* ── Encabezado ─────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-headline text-3xl font-black uppercase tracking-tight">
              Comunidad en el gym
            </h2>
            <div style={{ fontFamily: 'monospace', marginTop: 5, minHeight: 20 }}>
              {loading ? (
                <span style={{ fontSize: 10, color: '#2a3a50', letterSpacing: 2, textTransform: 'uppercase' }}>CONECTANDO...</span>
              ) : profiles.length > 0 ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7,
                  fontSize: 10, color: '#00cc88', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00cc88',
                    display: 'inline-block', animation: 'gymLivePulse 1.8s infinite' }} />
                  {profiles.length} SOCIO{profiles.length !== 1 ? 'S' : ''} ENTRENANDO AHORA
                </span>
              ) : (
                <span style={{ fontSize: 10, color: '#2a3a50', letterSpacing: 2, textTransform: 'uppercase' }}>SALA VACÍA</span>
              )}
            </div>
          </div>
        </div>

        {/* ── Loading ────────────────────────────────────────────────────── */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div className="w-8 h-8 border-2 border-[#00d8ff15] border-t-[#00d8ff] rounded-full animate-spin" />
          </div>
        )}

        {/* ── Estado vacío ───────────────────────────────────────────────── */}
        {isEmpty && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: 'linear-gradient(160deg, #0c1520 0%, #080e18 100%)',
              border: '2px solid #141e2c', padding: '72px 24px', textAlign: 'center', fontFamily: 'monospace' }}>
            <div style={{ fontSize: 52, marginBottom: 20, opacity: 0.1 }}>🏋️</div>
            <p style={{ fontSize: 10, color: '#00d8ff', textTransform: 'uppercase',
              letterSpacing: 4, fontWeight: 700, marginBottom: 10 }}>SALA VACÍA</p>
            <p style={{ fontSize: 10, color: '#2a3a50', lineHeight: 2 }}>
              Activá tu visibilidad en tu perfil<br />para aparecer aquí mientras entrenás.
            </p>
          </motion.div>
        )}

        {/* ── Grid de tarjetas ───────────────────────────────────────────── */}
        {!loading && profiles.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
            gap: 3,
          }}>
            <AnimatePresence>
              {profiles.map((profile, i) => (
                <MemberCard
                  key={profile.id}
                  profile={profile}
                  now={now}
                  slotIndex={i}
                  isSelected={selected?.id === profile.id}
                  onClick={() => setSelected(selected?.id === profile.id ? null : profile)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* ── Ranking de rachas ──────────────────────────────────────────── */}
        {withStreak.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            style={{ background: 'linear-gradient(160deg, #0c1520 0%, #080e18 100%)',
              border: '2px solid #141e2c', padding: '16px 20px 20px', fontFamily: 'monospace' }}>
            <p style={{ fontSize: 8, color: '#2a4060', textTransform: 'uppercase',
              letterSpacing: 3, marginBottom: 14, fontWeight: 700 }}>
              ▶ RANKING DE RACHAS · PRESENTES HOY
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {withStreak.map(({ p, i: si }, rank) => {
                const cfg    = { ...DEFAULT_AVATAR, ...p.avatarConfig } as AvatarConfig;
                const isAnon = p.socialVisibility === 'anonymous';
                const accent = SLOT_COLORS[si % SLOT_COLORS.length];
                const streak = p.currentStreak ?? 0;
                const pct    = maxStreak > 0 ? (streak / maxStreak) * 100 : 0;
                const medals = ['🥇', '🥈', '🥉'];
                return (
                  <button key={p.id}
                    onClick={() => setSelected(selected?.id === p.id ? null : p)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10,
                      background: 'none', border: 'none', padding: 0, cursor: 'pointer', width: '100%' }}>
                    <span style={{ fontSize: 14, width: 22, flexShrink: 0, textAlign: 'center' }}>
                      {medals[rank] ?? `${rank + 1}.`}
                    </span>
                    <div style={{ flexShrink: 0 }}>
                      <AvatarSprite config={cfg} size={20} isAnonymous={isAnon} />
                    </div>
                    <span style={{ fontSize: 9, color: '#6090b8', flex: 1, textTransform: 'uppercase',
                      letterSpacing: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                      {isAnon ? 'Anónimo' : p.displayName}
                    </span>
                    <div style={{ width: 90, height: 5, background: '#08101c', flexShrink: 0, position: 'relative' }}>
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, delay: rank * 0.08 + 0.2 }}
                        style={{ position: 'absolute', top: 0, left: 0,
                          height: '100%', background: accent, boxShadow: `0 0 6px ${accent}80` }}
                      />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#f06020', minWidth: 40, textAlign: 'right' }}>
                      🔥{streak}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Modal ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selected && (() => {
          const si = profiles.findIndex(p => p.id === selected.id);
          return (
            <ProfileModal
              key={selected.id}
              profile={selected}
              now={now}
              slotIndex={si >= 0 ? si : 0}
              onClose={() => setSelected(null)}
            />
          );
        })()}
      </AnimatePresence>
    </>
  );
}
