'use client';

export type AvatarSex = 'male' | 'female';
export type AvatarHairStyle = 'short' | 'long' | 'mohawk' | 'bun';

export interface AvatarConfig {
  sex: AvatarSex;
  hairStyle: AvatarHairStyle;
  hairColor: string;
  outfitColor: string;
  skinColor: string;
}

export const DEFAULT_AVATAR: AvatarConfig = {
  sex: 'male',
  hairStyle: 'short',
  hairColor: '#2c1a0e',
  outfitColor: '#1565c0',
  skinColor: '#f5c88a',
};

function darken(hex: string, amt = 28): string {
  const h = hex.replace('#', '');
  if (h.length !== 6) return hex;
  return '#' + [0,2,4].map(i =>
    Math.max(0, parseInt(h.slice(i, i+2), 16) - amt).toString(16).padStart(2, '0')
  ).join('');
}

type RP = { x:number; y:number; w:number; h:number; fill:string };
const R = (fill:string, x:number, y:number, w:number, h:number): RP => ({ x, y, w, h, fill });

function getHair(style: AvatarHairStyle, color: string, female: boolean): RP[] {
  const d = darken(color);
  switch(style) {
    case 'short': return [
      R(color,  2, 1, 12, 5),
      R(d,      3, 1, 10, 2),
      R(color,  1, 3,  1, 2), // left sideburn
      R(color, 14, 3,  1, 2), // right sideburn
    ];
    case 'long': return [
      R(color,  2,  1, 12, 5),
      R(d,      3,  1, 10, 2),
      R(color,  1,  3,  2, 16), // left curtain
      R(color, 13,  3,  2, 16), // right curtain
      R(d,      1, 14,  2,  5),
      R(d,     13, 14,  2,  5),
    ];
    case 'mohawk': return [
      R(color,  6, -4,  4, 10),
      R(d,      7, -4,  2,  8),
      R(color,  2,  3,  2,  3), // sideburn L
      R(color, 12,  3,  2,  3), // sideburn R
    ];
    case 'bun': return [
      R(color,  4, -2,  8,  5),
      R(d,      5, -2,  6,  3),
      R(color,  2,  2, 12,  3),
    ];
  }
}

interface Props {
  config?: Partial<AvatarConfig>;
  size?: number;
  isAnonymous?: boolean;
  isSelected?: boolean;
  label?: string;
}

export default function AvatarSprite({ config, size = 48, isAnonymous, isSelected, label }: Props) {
  const cfg: AvatarConfig = { ...DEFAULT_AVATAR, ...config };
  const sk   = cfg.skinColor;
  const skD  = darken(sk, 22);
  const ot   = cfg.outfitColor;
  const otD  = darken(ot, 28);
  const f    = cfg.sex === 'female';
  const pant = '#1c2440';
  const pantD = darken(pant, 16);
  const shoe = '#0a0a0a';
  const OL   = '#00000066';
  const sw   = 0.25;

  if (isAnonymous) {
    return (
      <div className="flex flex-col items-center gap-1">
        <svg viewBox="0 0 16 33" width={size} height={Math.round(size * 2.0625)}
          shapeRendering="crispEdges" style={{ imageRendering:'pixelated' }}>
          <rect x={2}  y={3} width={12} height={10} fill="#555" stroke={OL} strokeWidth={sw}/>
          <rect x={5}  y={6} width={6}  height={6}  fill="#333"/>
          <text x={8} y={11} textAnchor="middle" fontSize="5" fill="#ccc" fontFamily="monospace">?</text>
          <rect x={3}  y={13} width={10} height={9} fill="#444" stroke={OL} strokeWidth={sw}/>
          <rect x={0}  y={13} width={3}  height={8} fill="#444" stroke={OL} strokeWidth={sw}/>
          <rect x={13} y={13} width={3}  height={8} fill="#444" stroke={OL} strokeWidth={sw}/>
          <rect x={4}  y={22} width={3}  height={7} fill={pantD} stroke={OL} strokeWidth={sw}/>
          <rect x={9}  y={22} width={3}  height={7} fill={pantD} stroke={OL} strokeWidth={sw}/>
          <rect x={3}  y={29} width={5}  height={3} fill={shoe} stroke={OL} strokeWidth={sw}/>
          <rect x={8}  y={29} width={5}  height={3} fill={shoe} stroke={OL} strokeWidth={sw}/>
        </svg>
        {label && <span style={{ fontFamily:'monospace', fontSize:8, color:'#888', textTransform:'uppercase', letterSpacing:1 }}>{label}</span>}
      </div>
    );
  }

  const body: RP[] = [
    // ── Head ──────────────────────────────────────────
    R(sk,   2,  3, 12, 10),
    R(skD,  2, 11, 12,  2),  // bottom shadow
    // Eyes
    R('#111', 4,  7, 2, 2),
    R('#111', 10, 7, 2, 2),
    R('#fff', 5,  7, 1, 1),  // highlights
    R('#fff', 11, 7, 1, 1),
    // Nose dot
    R(skD, 7, 10, 2, 1),
    // Smile
    R(skD, 5, 12, 2, 1),
    R(skD, 9, 12, 2, 1),
    // ── Neck ──────────────────────────────────────────
    R(sk,   6, 13, 4, 2),
    // ── Body ──────────────────────────────────────────
    R(ot,   3, 13, 10, 9),
    R(otD,  3, 20, 10, 2),   // bottom shadow
    // Female bust detail
    ...(f ? [R(darken(ot,12), 4, 15, 8, 3)] : []),
    // Belt
    R(otD,  3, 22, 10, 1),
    // ── Arms ──────────────────────────────────────────
    R(ot,   0, 13,  3, 8),   // left
    R(ot,  13, 13,  3, 8),   // right
    R(otD,  0, 19,  3, 2),
    R(otD, 13, 19,  3, 2),
    // ── Hands ─────────────────────────────────────────
    R(sk,   0, 21, 3, 3),
    R(sk,  13, 21, 3, 3),
    // ── Legs ──────────────────────────────────────────
    R(pant, 4, 23, 3, 6),
    R(pant, 9, 23, 3, 6),
    R(pantD, 8, 23, 1, 4),   // gap between legs
    // ── Shoes ─────────────────────────────────────────
    R(shoe, 3, 29, 5, 3),
    R(shoe, 8, 29, 5, 3),
  ];

  const hair = getHair(cfg.hairStyle, cfg.hairColor, f);

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, position:'relative' }}>
      {isSelected && (
        <div style={{
          position:'absolute', inset:-3,
          outline:'2px solid #4dabf7',
          boxShadow:'0 0 0 1px #4dabf7, 0 0 10px #4dabf780',
          pointerEvents:'none',
        }}/>
      )}
      <svg viewBox="0 0 16 33" width={size} height={Math.round(size * 2.0625)}
        shapeRendering="crispEdges" style={{ imageRendering:'pixelated', display:'block' }}>
        {body.map((r, i) => (
          <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill={r.fill} stroke={OL} strokeWidth={sw}/>
        ))}
        {hair.map((r, i) => (
          <rect key={`h${i}`} x={r.x} y={r.y} width={r.w} height={r.h} fill={r.fill} stroke={OL} strokeWidth={sw}/>
        ))}
      </svg>
      {label && (
        <span style={{ fontFamily:'monospace', fontSize:8, color:'#d0d0d0', textTransform:'uppercase', letterSpacing:1, textShadow:'0 1px 2px #000' }}>
          {label}
        </span>
      )}
    </div>
  );
}
