'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PublicGymPresence, socialService } from '@/services/social.service';

interface ExtendedPresence extends PublicGymPresence {
  checkedInAt?: { toDate?: () => Date } | string | null;
}

// Pares de gradiente por slot — garantizan variedad visual
const GRADIENTS = [
  ['#00c6fb', '#005bea'],   // cyan → blue
  ['#f77062', '#fe5196'],   // coral → pink
  ['#43e97b', '#38f9d7'],   // green → teal
  ['#a18cd1', '#fbc2eb'],   // purple → pink
  ['#ffecd2', '#fcb69f'],   // peach → salmon
  ['#84fab0', '#8fd3f4'],   // mint → sky
];

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

function getInitials(name: string, isAnon: boolean): string {
  if (isAnon) return '?';
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase() || '?';
}

// ── Avatar circular moderno ───────────────────────────────────────────────────

function Avatar({ name, isAnon, gradientIdx, photoURL, size = 96 }: {
  name: string;
  isAnon: boolean;
  gradientIdx: number;
  photoURL?: string;
  size?: number;
}) {
  const [from, to] = GRADIENTS[gradientIdx % GRADIENTS.length];
  const initials   = getInitials(name, isAnon);
  const fontSize   = size * 0.33;

  if (photoURL && !isAnon) {
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        overflow: 'hidden', position: 'relative',
        boxShadow: `0 4px 20px ${from}50`,
      }}>
        <img
          src={photoURL}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
    );
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
      boxShadow: `0 4px 20px ${from}50, 0 1px 0 rgba(255,255,255,0.15) inset`,
    }}>
      <div style={{
        position: 'absolute', top: '-20%', left: '-10%',
        width: '70%', height: '60%', borderRadius: '50%',
        background: 'rgba(255,255,255,0.18)',
        filter: 'blur(8px)',
        pointerEvents: 'none',
      }} />
      <span style={{
        fontSize, fontWeight: 800, color: 'rgba(255,255,255,0.95)',
        letterSpacing: -0.5, userSelect: 'none',
        textShadow: '0 1px 4px rgba(0,0,0,0.25)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        position: 'relative', zIndex: 1,
      }}>
        {initials}
      </span>
    </div>
  );
}

// ── Tarjeta de miembro ────────────────────────────────────────────────────────

function MemberCard({ profile, now, idx, isSelected, onClick }: {
  profile: ExtendedPresence;
  now: number;
  idx: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  const isAnon  = profile.socialVisibility === 'anonymous';
  const elapsed = fmtElapsed(profile.checkedInAt, now);
  const streak  = typeof profile.currentStreak === 'number' ? profile.currentStreak : null;
  const [from]  = GRADIENTS[idx % GRADIENTS.length];

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: idx * 0.07 }}
      onClick={onClick}
      className="focus:outline-none text-left"
      style={{
        width: '100%',
        background: isSelected ? '#111827' : '#0d1424',
        border: `1.5px solid ${isSelected ? from + 'aa' : '#1e2d42'}`,
        borderRadius: 16,
        padding: '28px 20px 22px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        cursor: 'pointer', position: 'relative', overflow: 'hidden',
        boxShadow: isSelected
          ? `0 0 0 1px ${from}30, 0 20px 60px ${from}15`
          : '0 2px 12px rgba(0,0,0,0.4)',
        transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
      }}
    >
      {/* Glow de fondo sutil cuando está seleccionado */}
      {isSelected && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: `radial-gradient(ellipse at 50% 0%, ${from}14 0%, transparent 65%)`,
          pointerEvents: 'none',
        }} />
      )}

      {/* Badge LIVE */}
      <div style={{
        position: 'absolute', top: 14, right: 14,
        display: 'flex', alignItems: 'center', gap: 5,
        background: '#0a2818', borderRadius: 20, padding: '3px 8px',
        border: '1px solid #00cc8830',
      }}>
        <span style={{
          width: 5, height: 5, borderRadius: '50%', background: '#00cc88',
          display: 'inline-block', animation: 'gymPulse 2s ease-in-out infinite',
        }} />
        <span style={{
          fontFamily: 'monospace', fontSize: 8, fontWeight: 700,
          color: '#00cc88', letterSpacing: 1.5, textTransform: 'uppercase',
        }}>
          LIVE
        </span>
      </div>

      {/* Avatar */}
      <div style={{ position: 'relative' }}>
        {/* Ring pulsante */}
        {isSelected && (
          <div style={{
            position: 'absolute', inset: -4, borderRadius: '50%',
            border: `2px solid ${from}60`,
            animation: 'gymRingPulse 2.5s ease-in-out infinite',
          }} />
        )}
        <Avatar
          name={profile.displayName}
          isAnon={isAnon}
          gradientIdx={idx}
          photoURL={profile.photoURL}
          size={88}
        />
      </div>

      {/* Nombre */}
      <div style={{ textAlign: 'center', maxWidth: '100%' }}>
        <p style={{
          fontSize: 14, fontWeight: 700,
          color: isSelected ? '#ffffff' : '#e8f0f8',
          letterSpacing: 0.3, lineHeight: 1.2,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          maxWidth: '100%',
        }}>
          {isAnon ? 'Anónimo' : profile.displayName}
        </p>
        {!isAnon && profile.instagram && (
          <p style={{
            fontSize: 10, color: from, marginTop: 2,
            fontFamily: 'monospace', letterSpacing: 0.5, opacity: 0.8,
          }}>
            {profile.instagram}
          </p>
        )}
      </div>

      {/* Stats */}
      {(elapsed || (streak !== null && streak > 0)) && (
        <div style={{
          display: 'flex', gap: 18,
          borderTop: '1px solid #1e2d42', paddingTop: 12, width: '100%',
          justifyContent: 'center',
        }}>
          {elapsed && (
            <div style={{ textAlign: 'center' }}>
              <p style={{
                fontSize: 16, fontWeight: 800, lineHeight: 1,
                color: from, fontFamily: 'system-ui, sans-serif',
              }}>
                {elapsed}
              </p>
              <p style={{ fontSize: 9, color: '#3a5070', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 4, fontFamily: 'monospace' }}>
                en gym
              </p>
            </div>
          )}
          {streak !== null && streak > 0 && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 16, fontWeight: 800, color: '#f97316', lineHeight: 1, fontFamily: 'system-ui, sans-serif' }}>
                🔥 {streak}
              </p>
              <p style={{ fontSize: 9, color: '#3a5070', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 4, fontFamily: 'monospace' }}>
                racha
              </p>
            </div>
          )}
        </div>
      )}

      {/* Bio */}
      {!isAnon && profile.publicBio && (
        <p style={{
          fontSize: 11, color: '#4a6080', lineHeight: 1.6,
          textAlign: 'center', maxWidth: '100%',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          fontFamily: 'system-ui, sans-serif',
        } as React.CSSProperties}>
          {profile.publicBio}
        </p>
      )}
    </motion.button>
  );
}

// ── Modal de perfil ───────────────────────────────────────────────────────────

function ProfileModal({ profile, now, idx, onClose }: {
  profile: ExtendedPresence;
  now: number;
  idx: number;
  onClose: () => void;
}) {
  const isAnon  = profile.socialVisibility === 'anonymous';
  const elapsed = fmtElapsed(profile.checkedInAt, now);
  const [from, to] = GRADIENTS[idx % GRADIENTS.length];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-end md:items-center justify-center p-4"
      role="dialog" aria-modal="true"
    >
      <button className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />
      <motion.div
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 300 }}
        className="relative w-full max-w-xs overflow-hidden"
        style={{
          background: '#0d1424',
          borderRadius: 20,
          border: '1.5px solid #1e2d42',
          boxShadow: `0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px ${from}25`,
        }}
      >
        {/* Header con gradiente */}
        <div style={{
          height: 120, position: 'relative', overflow: 'hidden',
          background: `linear-gradient(135deg, ${from}55 0%, ${to}44 100%)`,
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, transparent 30%, #0d1424)',
          }} />
          <button onClick={onClose} style={{
            position: 'absolute', top: 14, right: 14, width: 32, height: 32,
            borderRadius: '50%', background: 'rgba(0,0,0,0.3)',
            border: 'none', color: 'white', fontSize: 18, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>

        {/* Avatar centrado sobre el header */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: -52, position: 'relative', zIndex: 10 }}>
          <div style={{ padding: 4, borderRadius: '50%', background: '#0d1424' }}>
            <Avatar name={profile.displayName} isAnon={isAnon} gradientIdx={idx} photoURL={profile.photoURL} size={96} />
          </div>
        </div>

        <div style={{ padding: '12px 28px 28px', textAlign: 'center' }}>
          {/* Live badge */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: '#0a2818', borderRadius: 20, padding: '4px 12px',
              border: '1px solid #00cc8840',
              fontFamily: 'monospace', fontSize: 8, fontWeight: 700,
              color: '#00cc88', letterSpacing: 1.5, textTransform: 'uppercase',
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#00cc88', animation: 'gymPulse 2s infinite', display: 'inline-block' }} />
              ENTRENANDO AHORA
            </span>
          </div>

          <h3 style={{
            fontSize: 20, fontWeight: 800, color: 'white', letterSpacing: 0.2,
            fontFamily: 'system-ui, sans-serif', margin: '0 0 4px',
          }}>
            {isAnon ? 'Anónimo' : profile.displayName}
          </h3>
          {!isAnon && profile.instagram && (
            <p style={{ fontSize: 12, color: from, fontFamily: 'monospace', marginBottom: 0 }}>
              {profile.instagram}
            </p>
          )}

          {/* Stats */}
          {(elapsed || (typeof profile.currentStreak === 'number' && profile.currentStreak > 0)) && (
            <div style={{
              display: 'flex', marginTop: 20, borderRadius: 12,
              background: '#111827', border: '1px solid #1e2d42', overflow: 'hidden',
            }}>
              {elapsed && (
                <div style={{ flex: 1, padding: '14px 0' }}>
                  <p style={{ fontSize: 22, fontWeight: 800, color: from, lineHeight: 1, fontFamily: 'system-ui, sans-serif' }}>
                    {elapsed}
                  </p>
                  <p style={{ fontSize: 9, color: '#3a5070', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 4, fontFamily: 'monospace' }}>
                    en gym hoy
                  </p>
                </div>
              )}
              {typeof profile.currentStreak === 'number' && profile.currentStreak > 0 && (
                <div style={{
                  flex: 1, padding: '14px 0',
                  borderLeft: elapsed ? '1px solid #1e2d42' : 'none',
                }}>
                  <p style={{ fontSize: 22, fontWeight: 800, color: '#f97316', lineHeight: 1, fontFamily: 'system-ui, sans-serif' }}>
                    🔥 {profile.currentStreak}
                  </p>
                  <p style={{ fontSize: 9, color: '#3a5070', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 4, fontFamily: 'monospace' }}>
                    días de racha
                  </p>
                </div>
              )}
            </div>
          )}

          {!isAnon && profile.publicBio && (
            <p style={{ fontSize: 12, color: '#5a7090', lineHeight: 1.7, marginTop: 16, fontFamily: 'system-ui, sans-serif' }}>
              {profile.publicBio}
            </p>
          )}
          {isAnon && (
            <p style={{ fontSize: 12, color: '#3a5070', fontStyle: 'italic', marginTop: 16, fontFamily: 'system-ui, sans-serif' }}>
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

  const withStreak = profiles
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => typeof p.currentStreak === 'number' && p.currentStreak > 0)
    .sort((a, b) => (b.p.currentStreak ?? 0) - (a.p.currentStreak ?? 0));

  const maxStreak = withStreak[0]?.p.currentStreak ?? 1;
  const cols = profiles.length === 1 ? 1 : profiles.length === 2 ? 2 : profiles.length === 3 ? 3 : 4;

  return (
    <>
      <style>{`
        @keyframes gymPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.25; transform: scale(0.65); }
        }
        @keyframes gymRingPulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50%       { opacity: 0.2; transform: scale(1.08); }
        }
      `}</style>

      <div className="space-y-4 animate-in fade-in duration-500">

        {/* ── Encabezado ─────────────────────────────────────────────────── */}
        <div>
          <h2 className="font-headline text-3xl font-black uppercase tracking-tight">
            Comunidad en el gym
          </h2>
          <div style={{ marginTop: 6, minHeight: 22 }}>
            {loading ? (
              <span style={{ fontSize: 12, color: '#3a5070', fontFamily: 'monospace', letterSpacing: 1 }}>
                Conectando...
              </span>
            ) : profiles.length > 0 ? (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                fontSize: 12, color: '#00cc88', fontWeight: 600,
                fontFamily: 'system-ui, sans-serif',
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%', background: '#00cc88',
                  animation: 'gymPulse 2s infinite', display: 'inline-block',
                }} />
                {profiles.length} {profiles.length === 1 ? 'socio' : 'socios'} entrenando ahora
              </span>
            ) : (
              <span style={{ fontSize: 12, color: '#2a3a50', fontFamily: 'system-ui, sans-serif' }}>
                Sala vacía
              </span>
            )}
          </div>
        </div>

        {/* ── Loading ────────────────────────────────────────────────────── */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div className="w-8 h-8 border-2 border-[#1e3050] border-t-[#00c6fb] rounded-full animate-spin" />
          </div>
        )}

        {/* ── Estado vacío ───────────────────────────────────────────────── */}
        {isEmpty && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{
              background: '#0d1424', borderRadius: 16, border: '1.5px solid #1e2d42',
              padding: '72px 24px', textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.15 }}>🏋️</div>
            <p style={{
              fontSize: 15, fontWeight: 600, color: '#d0e4f8', marginBottom: 8,
              fontFamily: 'system-ui, sans-serif',
            }}>
              La sala está vacía
            </p>
            <p style={{ fontSize: 12, color: '#2a3a50', lineHeight: 1.8, fontFamily: 'system-ui, sans-serif' }}>
              Activá tu visibilidad en tu perfil<br />para aparecer aquí mientras entrenás.
            </p>
          </motion.div>
        )}

        {/* ── Grid de tarjetas ───────────────────────────────────────────── */}
        {!loading && profiles.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12 }}>
            <AnimatePresence>
              {profiles.map((profile, i) => (
                <MemberCard
                  key={profile.id}
                  profile={profile}
                  now={now}
                  idx={i}
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
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              background: '#0d1424', borderRadius: 16,
              border: '1.5px solid #1e2d42', padding: '18px 20px 20px',
            }}
          >
            <p style={{
              fontSize: 11, color: '#3a5270', textTransform: 'uppercase',
              letterSpacing: 2, marginBottom: 14, fontWeight: 700, fontFamily: 'monospace',
            }}>
              Ranking de rachas · presentes hoy
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {withStreak.map(({ p, i: si }, rank) => {
                const isAnon = p.socialVisibility === 'anonymous';
                const [from] = GRADIENTS[si % GRADIENTS.length];
                const streak = p.currentStreak ?? 0;
                const pct    = maxStreak > 0 ? (streak / maxStreak) * 100 : 0;
                const medals = ['🥇', '🥈', '🥉'];
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelected(selected?.id === p.id ? null : p)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontSize: 16, width: 24, textAlign: 'center', flexShrink: 0 }}>
                      {medals[rank] ?? <span style={{ fontSize: 11, color: '#3a5070', fontFamily: 'monospace' }}>{rank + 1}</span>}
                    </span>
                    <Avatar name={p.displayName} isAnon={isAnon} gradientIdx={si} photoURL={p.photoURL} size={28} />
                    <span style={{
                      fontSize: 13, color: '#8aabca', flex: 1, fontWeight: 500,
                      overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                      fontFamily: 'system-ui, sans-serif', textAlign: 'left',
                    }}>
                      {isAnon ? 'Anónimo' : p.displayName}
                    </span>
                    <div style={{ width: 80, height: 4, background: '#111827', borderRadius: 2, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, delay: rank * 0.08 + 0.2 }}
                        style={{ position: 'absolute', top: 0, left: 0, height: '100%', background: from, borderRadius: 2 }}
                      />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#f97316', minWidth: 36, textAlign: 'right', fontFamily: 'system-ui, sans-serif' }}>
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
            <ProfileModal key={selected.id} profile={selected} now={now} idx={si >= 0 ? si : 0} onClose={() => setSelected(null)} />
          );
        })()}
      </AnimatePresence>
    </>
  );
}
