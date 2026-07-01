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
  outfitColor: '#1a73e8',
  skinColor: '#f5c8a0',
};

const HAIR_PATHS: Record<AvatarSex, Record<AvatarHairStyle, string>> = {
  male: {
    short:   'M6,8 Q8,2 16,2 Q24,2 26,8 L26,12 Q20,8 16,8 Q12,8 6,12 Z',
    long:    'M4,8 Q8,2 16,2 Q24,2 28,8 L28,30 Q24,26 22,22 L22,14 Q20,8 16,8 Q12,8 10,14 L10,22 Q8,26 4,30 Z',
    mohawk:  'M13,2 L19,2 L20,14 L16,12 L12,14 Z M11,6 L13,2 M21,6 L19,2',
    bun:     'M8,10 Q8,2 16,2 Q24,2 24,10 L24,14 Q20,10 16,10 Q12,10 8,14 Z M14,4 Q16,0 18,4',
  },
  female: {
    short:   'M5,8 Q8,2 16,2 Q24,2 27,8 L27,13 Q20,8 16,8 Q12,8 5,13 Z',
    long:    'M4,8 Q8,2 16,2 Q24,2 28,8 L30,36 Q26,28 24,22 L24,14 Q20,8 16,8 Q12,8 8,14 L8,22 Q6,28 2,36 Z',
    mohawk:  'M12,2 L20,2 L21,14 L16,11 L11,14 Z',
    bun:     'M6,10 Q7,2 16,2 Q25,2 26,10 L26,14 Q20,10 16,10 Q12,10 6,14 Z M12,3 Q16,-2 20,3',
  },
};

interface Props {
  config?: Partial<AvatarConfig>;
  size?: number;
  isAnonymous?: boolean;
  label?: string;
  isSelected?: boolean;
}

export default function AvatarSprite({ config, size = 48, isAnonymous, label, isSelected }: Props) {
  const cfg: AvatarConfig = { ...DEFAULT_AVATAR, ...config };
  const scale = size / 32;

  if (isAnonymous) {
    return (
      <div className="flex flex-col items-center gap-1" style={{ width: size }}>
        <svg width={size} height={size * 1.5} viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="10" r="8" fill="#888" />
          <text x="16" y="14" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">?</text>
          <rect x="8" y="20" width="16" height="18" rx="3" fill="#666" />
          <rect x="4" y="20" width="6" height="14" rx="2" fill="#666" />
          <rect x="22" y="20" width="6" height="14" rx="2" fill="#666" />
          <rect x="9" y="36" width="6" height="10" rx="2" fill="#555" />
          <rect x="17" y="36" width="6" height="10" rx="2" fill="#555" />
        </svg>
        {label && <span className="font-label text-[8px] uppercase tracking-widest text-tertiary truncate max-w-[60px] text-center">{label}</span>}
      </div>
    );
  }

  const hairPath = HAIR_PATHS[cfg.sex][cfg.hairStyle];
  const isFemale = cfg.sex === 'female';

  return (
    <div className="flex flex-col items-center gap-1" style={{ width: size + 12 }}>
      <div className={`relative transition-transform duration-150 ${isSelected ? 'scale-110' : ''}`}>
        {isSelected && (
          <div
            className="absolute -inset-1 rounded-full opacity-60 animate-pulse"
            style={{ background: cfg.outfitColor, filter: 'blur(4px)', zIndex: 0 }}
          />
        )}
        <svg width={size} height={size * 1.5} viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg" style={{ position: 'relative', zIndex: 1 }}>
          {/* Hair back (for long styles) */}
          {(cfg.hairStyle === 'long') && (
            <path d={hairPath} fill={cfg.hairColor} opacity={0.7} />
          )}

          {/* Body / torso */}
          <rect x={isFemale ? 9 : 8} y="20" width={isFemale ? 14 : 16} height="18" rx="3" fill={cfg.outfitColor} />

          {/* Arms */}
          <rect x={isFemale ? 5 : 4} y="20" width="5" height="13" rx="2" fill={cfg.outfitColor} />
          <rect x={isFemale ? 22 : 23} y="20" width="5" height="13" rx="2" fill={cfg.outfitColor} />

          {/* Hands */}
          <circle cx={isFemale ? 7.5 : 6.5} cy="34" r="2.5" fill={cfg.skinColor} />
          <circle cx={isFemale ? 24.5 : 25.5} cy="34" r="2.5" fill={cfg.skinColor} />

          {/* Female chest detail */}
          {isFemale && (
            <ellipse cx="16" cy="23" rx="5" ry="2" fill={cfg.outfitColor} opacity={0.7} />
          )}

          {/* Legs */}
          <rect x="9" y="37" width="6" height="9" rx="2" fill="#333" />
          <rect x="17" y="37" width="6" height="9" rx="2" fill="#333" />

          {/* Shoes */}
          <rect x="8" y="44" width="8" height="4" rx="1.5" fill="#222" />
          <rect x="16" y="44" width="8" height="4" rx="1.5" fill="#222" />

          {/* Neck */}
          <rect x="13" y="17" width="6" height="5" rx="1" fill={cfg.skinColor} />

          {/* Head */}
          <ellipse cx="16" cy="10" rx={isFemale ? 8.5 : 8} ry={isFemale ? 9 : 8.5} fill={cfg.skinColor} />

          {/* Hair front */}
          {cfg.hairStyle !== 'long' && (
            <path d={hairPath} fill={cfg.hairColor} />
          )}
          {cfg.hairStyle === 'long' && (
            <path d={`M6,8 Q8,2 16,2 Q24,2 26,8 L26,13 Q20,9 16,9 Q12,9 6,13 Z`} fill={cfg.hairColor} />
          )}

          {/* Face */}
          {/* Eyes */}
          <circle cx="13" cy="10" r="1.5" fill="#333" />
          <circle cx="19" cy="10" r="1.5" fill="#333" />
          <circle cx="13.4" cy="9.4" r="0.5" fill="white" />
          <circle cx="19.4" cy="9.4" r="0.5" fill="white" />

          {/* Smile */}
          <path d="M13,13 Q16,15.5 19,13" stroke="#7a5c4f" strokeWidth="0.8" fill="none" strokeLinecap="round" />

          {/* Eyebrows */}
          <path d={isFemale ? 'M11.5,7.5 Q13,6.5 14.5,7.5' : 'M11,7 Q13,6 15,7'} stroke={cfg.hairColor} strokeWidth="1" fill="none" strokeLinecap="round" />
          <path d={isFemale ? 'M17.5,7.5 Q19,6.5 20.5,7.5' : 'M17,7 Q19,6 21,7'} stroke={cfg.hairColor} strokeWidth="1" fill="none" strokeLinecap="round" />

          {/* Female eyelashes */}
          {isFemale && (
            <>
              <path d="M11.5,8.5 L10.5,7.5 M13,8 L13,7 M14.5,8.5 L15,7.5" stroke={cfg.hairColor} strokeWidth="0.5" />
              <path d="M17.5,8.5 L17,7.5 M19,8 L19,7 M20.5,8.5 L21,7.5" stroke={cfg.hairColor} strokeWidth="0.5" />
            </>
          )}

          {/* Nose */}
          <circle cx="16" cy="12" r="0.7" fill="#c4956a" opacity={0.6} />
        </svg>
      </div>
      {label && (
        <span
          className="font-label text-[8px] uppercase tracking-wider text-on-surface truncate text-center leading-tight"
          style={{ maxWidth: size + 12 }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
