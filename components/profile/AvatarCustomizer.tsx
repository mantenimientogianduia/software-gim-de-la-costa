'use client';
import { useState } from 'react';
import AvatarSprite, { AvatarConfig, AvatarSex, AvatarHairStyle, DEFAULT_AVATAR } from '@/components/social/AvatarSprite';

interface Props {
  value?: Partial<AvatarConfig>;
  onChange: (config: AvatarConfig) => void;
}

const SKIN_TONES = ['#fddbb4', '#f5c8a0', '#e8a87c', '#c68642', '#8d5524', '#4a2912'];
const HAIR_COLORS = ['#2c1a0e', '#5c3317', '#8b4513', '#d4a017', '#f5f5dc', '#ff6b6b', '#845ef7', '#4dabf7'];
const OUTFIT_COLORS = ['#1a73e8', '#e53935', '#43a047', '#fb8c00', '#8e24aa', '#00acc1', '#f06292', '#546e7a'];

const HAIR_LABELS: Record<AvatarHairStyle, string> = {
  short: 'Corto',
  long: 'Largo',
  mohawk: 'Punk',
  bun: 'Rodete',
};

export default function AvatarCustomizer({ value, onChange }: Props) {
  const [cfg, setCfg] = useState<AvatarConfig>({ ...DEFAULT_AVATAR, ...value });

  function update(patch: Partial<AvatarConfig>) {
    const next = { ...cfg, ...patch };
    setCfg(next);
    onChange(next);
  }

  return (
    <div className="space-y-5">
      {/* Preview */}
      <div className="flex justify-center py-4 bg-surface-container-high rounded-xl">
        <AvatarSprite config={cfg} size={72} />
      </div>

      {/* Sex */}
      <div>
        <p className="font-label text-[9px] uppercase tracking-widest text-tertiary mb-2">Género</p>
        <div className="flex gap-2">
          {(['male', 'female'] as AvatarSex[]).map(s => (
            <button
              key={s}
              onClick={() => update({ sex: s })}
              className={`flex-1 py-2 rounded-lg font-label text-[10px] font-black uppercase tracking-widest transition-all
                ${cfg.sex === s ? 'bg-primary text-on-primary' : 'bg-surface-container ghost-border text-tertiary hover:bg-surface-container-high'}`}
            >
              {s === 'male' ? 'Masculino' : 'Femenino'}
            </button>
          ))}
        </div>
      </div>

      {/* Hair style */}
      <div>
        <p className="font-label text-[9px] uppercase tracking-widest text-tertiary mb-2">Peinado</p>
        <div className="grid grid-cols-4 gap-2">
          {(Object.keys(HAIR_LABELS) as AvatarHairStyle[]).map(style => (
            <button
              key={style}
              onClick={() => update({ hairStyle: style })}
              className={`py-2 rounded-lg font-label text-[9px] font-black uppercase tracking-wide transition-all
                ${cfg.hairStyle === style ? 'bg-primary text-on-primary' : 'bg-surface-container ghost-border text-tertiary hover:bg-surface-container-high'}`}
            >
              {HAIR_LABELS[style]}
            </button>
          ))}
        </div>
      </div>

      {/* Skin color */}
      <div>
        <p className="font-label text-[9px] uppercase tracking-widest text-tertiary mb-2">Tono de piel</p>
        <div className="flex gap-2 flex-wrap">
          {SKIN_TONES.map(color => (
            <button
              key={color}
              onClick={() => update({ skinColor: color })}
              className={`w-9 h-9 rounded-lg border-2 transition-all ${cfg.skinColor === color ? 'border-primary scale-110 shadow-glow' : 'border-transparent hover:border-primary/50'}`}
              style={{ background: color }}
              aria-label={`Piel ${color}`}
            />
          ))}
        </div>
      </div>

      {/* Hair color */}
      <div>
        <p className="font-label text-[9px] uppercase tracking-widest text-tertiary mb-2">Color de pelo</p>
        <div className="flex gap-2 flex-wrap">
          {HAIR_COLORS.map(color => (
            <button
              key={color}
              onClick={() => update({ hairColor: color })}
              className={`w-9 h-9 rounded-lg border-2 transition-all ${cfg.hairColor === color ? 'border-primary scale-110 shadow-glow' : 'border-transparent hover:border-primary/50'}`}
              style={{ background: color }}
              aria-label={`Pelo ${color}`}
            />
          ))}
        </div>
      </div>

      {/* Outfit color */}
      <div>
        <p className="font-label text-[9px] uppercase tracking-widest text-tertiary mb-2">Color de ropa</p>
        <div className="flex gap-2 flex-wrap">
          {OUTFIT_COLORS.map(color => (
            <button
              key={color}
              onClick={() => update({ outfitColor: color })}
              className={`w-9 h-9 rounded-lg border-2 transition-all ${cfg.outfitColor === color ? 'border-primary scale-110 shadow-glow' : 'border-transparent hover:border-primary/50'}`}
              style={{ background: color }}
              aria-label={`Ropa ${color}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
