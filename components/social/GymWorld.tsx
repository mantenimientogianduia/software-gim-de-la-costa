'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PublicGymPresence, socialService } from '@/services/social.service';
import AvatarSprite, { AvatarConfig, DEFAULT_AVATAR } from './AvatarSprite';

interface ExtendedPresence extends PublicGymPresence {
  avatarConfig?: Partial<AvatarConfig>;
  checkedInAt?: { toDate?: () => Date } | string | null;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

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
    const d = typeof ts === 'object' && ts.toDate ? ts.toDate() : new Date(ts as string);
    const mins = Math.max(0, Math.floor((now - d.getTime()) / 60_000));
    if (mins < 1) return 'recién';
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60), m = mins % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  } catch {
    return '';
  }
}

// Genera un color de contraste legible sobre un color de fondo
function isLight(hex: string): boolean {
  const h = hex.replace('#', '');
  if (h.length < 6) return false;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

// ── Tarjeta de miembro ────────────────────────────────────────────────────────

interface CardProps {
  profile: ExtendedPresence;
  now: number;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}

function MemberCard({ profile, now, index, isSelected, onClick }: CardProps) {
  const cfg: AvatarConfig = { ...DEFAULT_AVATAR, ...profile.avatarConfig };
  const isAnon = profile.socialVisibility === 'anonymous';
  const accent = isAnon ? '#4a5470' : (cfg.outfitColor || '#1565c0');
  const elapsed = fmtElapsed(profile.checkedInAt, now);
  const streak = profile.currentStreak;

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.25, delay: index * 0.07 }}
      onClick={onClick}
      className="focus:outline-none text-left w-full"
      style={{
        background: isSelected
          ? `linear-gradient(160deg, #101828 0%, #0d1525 100%)`
          : `linear-gradient(160deg, #0c1422 0%, #0a1020 100%)`,
        border: `2px solid ${isSelected ? accent : '#1c2a40'}`,
        boxShadow: isSelected
          ? `0 0 0 1px ${accent}30, 0 12px 40px ${accent}18, inset 0 1px 0 ${accent}15`
          : `inset 0 1px 0 #ffffff08`,
        padding: '0 0 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
      }}
      aria-label={`Ver perfil de ${profile.displayName}`}
    >
      {/* Franja de color superior */}
      <div style={{
        width: '100%',
        height: 4,
        background: accent,
        flexShrink: 0,
        boxShadow: `0 2px 10px ${accent}60`,
      }} />

      {/* Badge LIVE */}
      <div style={{
        position: 'absolute', top: 12, right: 10,
        display: 'flex', alignItems: 'center', gap: 4,
        fontFamily: 'monospace', fontSize: 7, fontWeight: 700,
        color: '#00cc88', textTransform: 'uppercase', letterSpacing: 2,
      }}>
        <span style={{
          width: 5, height: 5, borderRadius: '50%',
          background: '#00cc88',
          display: 'inline-block',
          animation: 'gym-pulse 1.8s ease-in-out infinite',
        }} />
        LIVE
      </div>

      {/* Avatar */}
      <div style={{ marginTop: 20, marginBottom: 8 }}>
        <motion.div
          animate={isSelected ? { filter: `drop-shadow(0 0 12px ${accent}90)` } : { filter: 'none' }}
          transition={{ duration: 0.2 }}
        >
          <AvatarSprite config={cfg} size={72} isAnonymous={isAnon} isSelected={isSelected} />
        </motion.div>
      </div>

      {/* Nombre */}
      <p style={{
        fontFamily: 'monospace',
        fontSize: 10,
        fontWeight: 700,
        color: isSelected ? '#ffffff' : '#c8daea',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        padding: '0 12px',
        textAlign: 'center',
        lineHeight: 1.3,
        wordBreak: 'break-word',
        maxWidth: '100%',
      }}>
        {isAnon ? '??? ANÓNIMO' : profile.displayName}
      </p>

      {/* Instagram */}
      {!isAnon && profile.instagram && (
        <p style={{
          fontFamily: 'monospace', fontSize: 8,
          color: accent, marginTop: 2,
          letterSpacing: 1, opacity: 0.9,
        }}>
          {profile.instagram}
        </p>
      )}

      {/* Stats */}
      {(elapsed || (typeof streak === 'number' && streak > 0)) && (
        <div style={{
          display: 'flex', gap: 14, marginTop: 10, alignItems: 'center',
          borderTop: '1px solid #1a2840', paddingTop: 10, width: 'calc(100% - 24px)',
          justifyContent: 'center',
        }}>
          {elapsed && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 700, color: '#00d8ff', lineHeight: 1 }}>
                {elapsed}
              </p>
              <p style={{ fontFamily: 'monospace', fontSize: 6, color: '#3a5070', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 3 }}>
                EN GYM
              </p>
            </div>
          )}
          {typeof streak === 'number' && streak > 0 && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 700, color: '#f06020', lineHeight: 1 }}>
                🔥{streak}
              </p>
              <p style={{ fontFamily: 'monospace', fontSize: 6, color: '#3a5070', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 3 }}>
                RACHA
              </p>
            </div>
          )}
        </div>
      )}

      {/* Bio snippet */}
      {!isAnon && profile.publicBio && (
        <p style={{
          fontFamily: 'monospace', fontSize: 8, color: '#4a6080',
          lineHeight: 1.6, textAlign: 'center',
          padding: '8px 12px 0',
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

function ProfileModal({ profile, now, onClose }: {
  profile: ExtendedPresence;
  now: number;
  onClose: () => void;
}) {
  const cfg: AvatarConfig = { ...DEFAULT_AVATAR, ...profile.avatarConfig };
  const isAnon = profile.socialVisibility === 'anonymous';
  const accent = isAnon ? '#4a5470' : (cfg.outfitColor || '#1565c0');
  const elapsed = fmtElapsed(profile.checkedInAt, now);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-end md:items-center justify-center p-4"
      role="dialog" aria-modal="true"
    >
      <button className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        className="relative w-full max-w-sm"
        style={{
          background: 'linear-gradient(160deg, #0f1e30 0%, #0a1220 100%)',
          border: `2px solid ${accent}`,
          boxShadow: `4px 4px 0 ${accent}50, 0 24px 80px #00000090, 0 0 0 1px ${accent}20`,
          fontFamily: 'monospace',
          overflow: 'hidden',
        }}
      >
        {/* Header coloreado */}
        <div style={{
          height: 5, background: accent,
          boxShadow: `0 0 16px ${accent}80`,
        }} />

        <div style={{ padding: '24px 24px 28px' }}>
          {/* Cerrar */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 14, right: 14,
              width: 28, height: 28,
              border: `1px solid ${accent}`,
              color: accent,
              background: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'monospace',
            }}
          >
            ×
          </button>

          {/* Avatar + nombre */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <motion.div animate={{ filter: `drop-shadow(0 0 16px ${accent}80)` }}>
              <AvatarSprite config={cfg} size={96} isAnonymous={isAnon} />
            </motion.div>

            <div style={{ textAlign: 'center' }}>
              <p style={{
                fontSize: 8, letterSpacing: '0.3em', color: '#00cc88',
                textTransform: 'uppercase', fontWeight: 700, marginBottom: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#00cc88', display: 'inline-block', animation: 'gym-pulse 1.8s infinite' }} />
                ENTRENANDO AHORA
              </p>
              <h3 style={{
                fontSize: 20, fontWeight: 900, color: 'white',
                textTransform: 'uppercase', letterSpacing: 2, lineHeight: 1.1,
              }}>
                {isAnon ? 'ANÓNIMO' : profile.displayName}
              </h3>
              {!isAnon && profile.instagram && (
                <p style={{ fontSize: 10, color: accent, marginTop: 4, letterSpacing: 1 }}>
                  {profile.instagram}
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          {(elapsed || (typeof profile.currentStreak === 'number' && profile.currentStreak > 0)) && (
            <div style={{
              display: 'flex', gap: 0, marginTop: 20,
              borderTop: `1px solid ${accent}30`,
              borderBottom: `1px solid ${accent}20`,
              paddingTop: 16, paddingBottom: 16,
              justifyContent: 'center',
            }}>
              {elapsed && (
                <div style={{ textAlign: 'center', flex: 1, borderRight: `1px solid #1a2840` }}>
                  <p style={{ fontSize: 28, fontWeight: 900, color: '#00d8ff', lineHeight: 1 }}>{elapsed}</p>
                  <p style={{ fontSize: 7, color: '#3a5070', textTransform: 'uppercase', letterSpacing: 2, marginTop: 4 }}>EN GYM HOY</p>
                </div>
              )}
              {typeof profile.currentStreak === 'number' && profile.currentStreak > 0 && (
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <p style={{ fontSize: 28, fontWeight: 900, color: '#f06020', lineHeight: 1 }}>🔥{profile.currentStreak}</p>
                  <p style={{ fontSize: 7, color: '#3a5070', textTransform: 'uppercase', letterSpacing: 2, marginTop: 4 }}>DÍAS DE RACHA</p>
                </div>
              )}
            </div>
          )}

          {/* Bio */}
          {!isAnon && profile.publicBio && (
            <p style={{
              fontSize: 11, color: '#6080a0', lineHeight: 1.8,
              textAlign: 'center', marginTop: 16,
            }}>
              {profile.publicBio}
            </p>
          )}
          {isAnon && (
            <p style={{ fontSize: 10, color: '#3a5070', fontStyle: 'italic', textAlign: 'center', marginTop: 16 }}>
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
  const [loading, setLoading] = useState(true);
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

  // Ranking por racha
  const withStreak = [...profiles]
    .filter(p => typeof p.currentStreak === 'number' && p.currentStreak > 0)
    .sort((a, b) => (b.currentStreak ?? 0) - (a.currentStreak ?? 0));
  const maxStreak = withStreak[0]?.currentStreak ?? 1;

  // Columnas de la grilla según cantidad
  const cols = profiles.length === 1 ? 1
    : profiles.length === 2 ? 2
    : profiles.length === 3 ? 3
    : 4;

  return (
    <>
      <style>{`
        @keyframes gym-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.35; transform: scale(0.75); }
        }
      `}</style>

      <div className="space-y-4 animate-in fade-in duration-500">

        {/* ── Encabezado ─────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-headline text-3xl font-black uppercase tracking-tight">
              Comunidad en el gym
            </h2>
            <div style={{ fontFamily: 'monospace', marginTop: 5 }}>
              {loading ? (
                <span style={{ fontSize: 10, color: '#3a5070', letterSpacing: 2, textTransform: 'uppercase' }}>
                  CONECTANDO...
                </span>
              ) : profiles.length > 0 ? (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  fontSize: 10, color: '#00cc88', fontWeight: 700,
                  letterSpacing: 2, textTransform: 'uppercase',
                }}>
                  <span style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: '#00cc88', display: 'inline-block',
                    animation: 'gym-pulse 1.8s infinite',
                  }} />
                  {profiles.length} SOCIO{profiles.length !== 1 ? 'S' : ''} ENTRENANDO AHORA
                </span>
              ) : (
                <span style={{ fontSize: 10, color: '#2a3a50', letterSpacing: 2, textTransform: 'uppercase' }}>
                  SALA VACÍA
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Loading ────────────────────────────────────────────────────── */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
            <div className="w-8 h-8 border-2 border-[#00d8ff20] border-t-[#00d8ff] rounded-full animate-spin" />
          </div>
        )}

        {/* ── Estado vacío ───────────────────────────────────────────────── */}
        {isEmpty && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'linear-gradient(160deg, #0c1422 0%, #080e18 100%)',
              border: '2px solid #1a2840',
              padding: '64px 24px',
              textAlign: 'center',
              fontFamily: 'monospace',
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 20, opacity: 0.15 }}>🏋️</div>
            <p style={{
              fontSize: 10, color: '#00d8ff', textTransform: 'uppercase',
              letterSpacing: 4, fontWeight: 700, marginBottom: 10,
            }}>
              SALA VACÍA
            </p>
            <p style={{ fontSize: 10, color: '#2a3a50', lineHeight: 1.9 }}>
              Activá tu visibilidad en tu perfil<br />
              para aparecer aquí mientras entrenás.
            </p>
          </motion.div>
        )}

        {/* ── Grid de tarjetas ───────────────────────────────────────────── */}
        {!loading && profiles.length > 0 && (
          <AnimatePresence>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gap: 2,
            }}>
              {profiles.map((profile, i) => (
                <MemberCard
                  key={profile.id}
                  profile={profile}
                  now={now}
                  index={i}
                  isSelected={selected?.id === profile.id}
                  onClick={() => setSelected(selected?.id === profile.id ? null : profile)}
                />
              ))}
            </div>
          </AnimatePresence>
        )}

        {/* ── Ranking de rachas ──────────────────────────────────────────── */}
        {withStreak.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: profiles.length * 0.07 + 0.1 }}
            style={{
              background: 'linear-gradient(160deg, #0c1422 0%, #080e18 100%)',
              border: '2px solid #1a2840',
              padding: '16px 20px 20px',
              fontFamily: 'monospace',
            }}
          >
            <p style={{
              fontSize: 8, color: '#3a5270', textTransform: 'uppercase',
              letterSpacing: 3, marginBottom: 14, fontWeight: 700,
            }}>
              ▶ RANKING DE RACHAS · PRESENTES HOY
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {withStreak.map((p, i) => {
                const cfg: AvatarConfig = { ...DEFAULT_AVATAR, ...p.avatarConfig };
                const isAnon = p.socialVisibility === 'anonymous';
                const accent = isAnon ? '#4a5470' : (cfg.outfitColor || '#1565c0');
                const streak = p.currentStreak ?? 0;
                const pct = maxStreak > 0 ? (streak / maxStreak) * 100 : 0;
                const medals = ['🥇', '🥈', '🥉'];
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelected(selected?.id === p.id ? null : p)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      background: 'none', border: 'none', padding: 0,
                      cursor: 'pointer', textAlign: 'left', width: '100%',
                    }}
                  >
                    <span style={{ fontSize: 14, width: 22, flexShrink: 0, textAlign: 'center' }}>
                      {medals[i] ?? <span style={{ fontSize: 9, color: '#3a5070' }}>{i + 1}.</span>}
                    </span>
                    <div style={{ flexShrink: 0 }}>
                      <AvatarSprite config={cfg} size={20} isAnonymous={isAnon} />
                    </div>
                    <span style={{
                      fontSize: 9, color: '#8aa8c8', flex: 1,
                      textTransform: 'uppercase', letterSpacing: 1,
                      overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                    }}>
                      {isAnon ? 'Anónimo' : p.displayName}
                    </span>
                    {/* Barra de progreso */}
                    <div style={{ width: 90, height: 5, background: '#0a1020', flexShrink: 0, position: 'relative' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: i * 0.08 + 0.2 }}
                        style={{
                          position: 'absolute', top: 0, left: 0,
                          height: '100%', background: accent,
                          boxShadow: `0 0 6px ${accent}80`,
                        }}
                      />
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: '#f06020',
                      minWidth: 40, textAlign: 'right', flexShrink: 0,
                    }}>
                      🔥{streak}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Modal de perfil ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {selected && (
          <ProfileModal
            profile={selected}
            now={now}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
