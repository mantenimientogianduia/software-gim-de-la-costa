'use client';
import { useRef, useState } from 'react';
import { UserProfile, userService } from '@/services/user.service';
import { motion } from 'motion/react';
import { normalizeInstagram } from '@/services/social.service';

// ── Avatar circular de perfil ─────────────────────────────────────────────────

const GRADIENT_PAIRS = [
  ['#00c6fb', '#005bea'],
  ['#f77062', '#fe5196'],
  ['#43e97b', '#38f9d7'],
  ['#a18cd1', '#fbc2eb'],
];

function ProfileAvatar({ name, photoURL, size = 80 }: { name: string; photoURL?: string; size?: number }) {
  const [from, to] = GRADIENT_PAIRS[name.charCodeAt(0) % GRADIENT_PAIRS.length];
  const initials   = name.trim().split(/\s+/).slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase() || '?';

  if (photoURL) {
    return (
      <img
        src={photoURL}
        alt={name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{ fontSize: size * 0.34, fontWeight: 800, color: 'rgba(255,255,255,0.95)', letterSpacing: -0.5 }}>
        {initials}
      </span>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function PersonalInfo({ profile }: { profile: UserProfile & { id: string } }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData]   = useState({
    firstName:          profile.firstName || '',
    lastName:           profile.lastName || '',
    phone:              profile.phone || '',
    weight:             profile.weight || 0,
    height:             profile.height || 0,
    gender:             profile.gender || 'otro',
    otherSports:        profile.otherSports || '',
    fitnessLevel:       profile.fitnessLevel || 'principiante',
    healthObservations: profile.healthObservations || '',
    goals:              profile.goals || '',
    weeklyTrainingGoal: profile.weeklyTrainingGoal || 3,
    currentPlan:        profile.currentPlan || 'Básico',
    socialVisibility:   profile.socialVisibility || 'hidden',
    instagram:          profile.instagram || '',
    publicBio:          profile.publicBio || '',
  });

  const [photoURL, setPhotoURL]         = useState<string>(profile.photoURL || '');
  const [photoFile, setPhotoFile]       = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>(profile.photoURL || '');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [success, setSuccess]           = useState(false);
  const fileInputRef                    = useRef<HTMLInputElement>(null);

  const PRESET_SPORTS = ['Fútbol', 'Tenis', 'Natación', 'Running', 'Crossfit'];
  const isPreset      = PRESET_SPORTS.includes(formData.otherSports) || formData.otherSports === '';
  const sportsSelectValue = isPreset ? formData.otherSports : 'Otro';

  const fullName = `${formData.firstName} ${formData.lastName}`.trim() || profile.email;

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('La foto no puede superar 5 MB.'); return; }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      let finalPhotoURL = photoURL;

      if (photoFile) {
        setUploadingPhoto(true);
        finalPhotoURL = await userService.uploadProfilePhoto(profile.id, photoFile);
        setUploadingPhoto(false);
        setPhotoURL(finalPhotoURL);
        setPhotoFile(null);
      }

      await userService.updatePersonalInfo(profile.id, {
        ...formData,
        socialVisibility: formData.socialVisibility as UserProfile['socialVisibility'],
        instagram: normalizeInstagram(formData.instagram),
        ...(finalPhotoURL ? { photoURL: finalPhotoURL } : {}),
      });
      setSuccess(true);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
      setUploadingPhoto(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section className="bg-surface-container-low p-8 rounded-[2.5rem] ghost-border shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-headline font-bold text-lg uppercase tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">person</span>
            Información Personal
          </h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-all font-label text-xs font-bold uppercase tracking-widest"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              Editar
            </button>
          )}
        </div>

        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-4 bg-primary/10 border border-primary/20 rounded-2xl text-primary text-sm flex items-center gap-3"
          >
            <span className="material-symbols-outlined">check_circle</span>
            ¡Perfil actualizado con éxito!
          </motion.div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* ── Foto de perfil ── */}
            <div className="md:col-span-2 flex flex-col gap-3">
              <label className="font-label text-[10px] uppercase tracking-widest text-tertiary">
                Foto de perfil
              </label>
              <div className="flex items-center gap-6 p-5 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl">
                {/* Preview */}
                <div className="relative flex-shrink-0">
                  <ProfileAvatar name={fullName} photoURL={photoPreview} size={80} />
                  {photoPreview && (
                    <button
                      type="button"
                      onClick={() => { setPhotoPreview(''); setPhotoFile(null); setPhotoURL(''); }}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-error text-on-error text-xs flex items-center justify-center leading-none"
                      title="Quitar foto"
                    >
                      ×
                    </button>
                  )}
                </div>
                {/* Upload area */}
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 border border-outline-variant/30 rounded-xl text-sm text-secondary hover:bg-surface-container-high transition-all font-label"
                  >
                    <span className="material-symbols-outlined text-sm">upload</span>
                    {photoPreview ? 'Cambiar foto' : 'Subir foto'}
                  </button>
                  <p className="text-[10px] text-tertiary">JPG, PNG o WebP · máx. 5 MB</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* ── Campos de texto ── */}
            <div className="flex flex-col gap-2">
              <label className="font-label text-[10px] uppercase tracking-widest text-tertiary">Nombre</label>
              <input type="text" value={formData.firstName} required
                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-3 text-sm focus:border-primary outline-none transition-all" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-label text-[10px] uppercase tracking-widest text-tertiary">Apellido</label>
              <input type="text" value={formData.lastName} required
                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-3 text-sm focus:border-primary outline-none transition-all" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-label text-[10px] uppercase tracking-widest text-tertiary">Teléfono / WhatsApp</label>
              <input type="tel" value={formData.phone} placeholder="Ej: 2246123456"
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-3 text-sm focus:border-primary outline-none transition-all" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-label text-[10px] uppercase tracking-widest text-tertiary">Sexo</label>
              <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-3 text-sm focus:border-primary outline-none transition-all">
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-label text-[10px] uppercase tracking-widest text-tertiary">Nivel de Condición Física</label>
              <select value={formData.fitnessLevel} onChange={e => setFormData({ ...formData, fitnessLevel: e.target.value as any })}
                className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-3 text-sm focus:border-primary outline-none transition-all">
                <option value="principiante">Principiante</option>
                <option value="intermedio">Intermedio</option>
                <option value="avanzado">Avanzado</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-label text-[10px] uppercase tracking-widest text-tertiary">Peso (kg)</label>
              <input type="number" value={formData.weight}
                onChange={e => setFormData({ ...formData, weight: Number(e.target.value) })}
                className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-3 text-sm focus:border-primary outline-none transition-all" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-label text-[10px] uppercase tracking-widest text-tertiary">Altura (cm)</label>
              <input type="number" value={formData.height}
                onChange={e => setFormData({ ...formData, height: Number(e.target.value) })}
                className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-3 text-sm focus:border-primary outline-none transition-all" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-label text-[10px] uppercase tracking-widest text-tertiary">Meta Semanal (días)</label>
              <input type="number" min="1" max="7" value={formData.weeklyTrainingGoal}
                onChange={e => setFormData({ ...formData, weeklyTrainingGoal: Number(e.target.value) })}
                className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-3 text-sm focus:border-primary outline-none transition-all" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-label text-[10px] uppercase tracking-widest text-tertiary">¿Práctica otro deporte?</label>
              <select value={sportsSelectValue}
                onChange={e => {
                  if (e.target.value !== 'Otro') setFormData({ ...formData, otherSports: e.target.value });
                  else setFormData({ ...formData, otherSports: ' ' });
                }}
                className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-3 text-sm focus:border-primary outline-none transition-all">
                <option value="">No / Ninguno</option>
                <option value="Fútbol">Fútbol</option>
                <option value="Tenis">Tenis</option>
                <option value="Natación">Natación</option>
                <option value="Running">Running</option>
                <option value="Crossfit">Crossfit</option>
                <option value="Otro">Otro...</option>
              </select>
              {!isPreset && (
                <input type="text" value={formData.otherSports.trim()} placeholder="Especifique otro deporte..."
                  onChange={e => setFormData({ ...formData, otherSports: e.target.value })}
                  className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-3 text-sm focus:border-primary outline-none transition-all" />
              )}
            </div>

            {/* ── Perfil social ── */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="font-label text-[10px] uppercase tracking-widest text-tertiary">Perfil social</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { value: 'hidden',    label: 'No aparecer' },
                  { value: 'visible',   label: 'Aparecer con mi perfil' },
                  { value: 'anonymous', label: 'Socio anónimo' },
                ].map(option => (
                  <button key={option.value} type="button"
                    onClick={() => setFormData({ ...formData, socialVisibility: option.value as any })}
                    className={`p-4 rounded-xl border text-left font-label text-[10px] uppercase tracking-widest transition-all ${formData.socialVisibility === option.value ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-lowest border-outline-variant/20 text-tertiary'}`}>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-label text-[10px] uppercase tracking-widest text-tertiary">Instagram público</label>
              <input type="text" value={formData.instagram} placeholder="@usuario"
                onChange={e => setFormData({ ...formData, instagram: e.target.value })}
                className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-3 text-sm focus:border-primary outline-none transition-all" />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="font-label text-[10px] uppercase tracking-widest text-tertiary">Descripción pública</label>
              <textarea value={formData.publicBio} maxLength={160} placeholder="Algo corto para que otros socios sepan quién sos..."
                onChange={e => setFormData({ ...formData, publicBio: e.target.value })}
                className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-3 text-sm focus:border-primary outline-none transition-all h-20 resize-none" />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="font-label text-[10px] uppercase tracking-widest text-tertiary">Vista previa pública</label>
              <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-5 flex items-center gap-4">
                <ProfileAvatar name={formData.socialVisibility === 'anonymous' ? '?' : fullName} photoURL={formData.socialVisibility === 'anonymous' ? undefined : photoPreview} size={48} />
                <div>
                  <p className="font-headline font-black uppercase tracking-tight text-sm">
                    {formData.socialVisibility === 'anonymous' ? 'Socio anónimo' : fullName}
                  </p>
                  {formData.socialVisibility === 'visible' && normalizeInstagram(formData.instagram) && (
                    <p className="font-label text-[10px] uppercase tracking-widest text-primary mt-1">{normalizeInstagram(formData.instagram)}</p>
                  )}
                  {formData.socialVisibility === 'visible' && formData.publicBio && (
                    <p className="text-xs text-tertiary mt-2">{formData.publicBio}</p>
                  )}
                  {formData.socialVisibility === 'hidden' && (
                    <p className="text-xs text-tertiary mt-1">No vas a aparecer en Comunidad.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="font-label text-[10px] uppercase tracking-widest text-tertiary">Observaciones de Salud / Lesiones</label>
              <textarea value={formData.healthObservations} placeholder="Ej: Lesión en rodilla izquierda, asma, etc."
                onChange={e => setFormData({ ...formData, healthObservations: e.target.value })}
                className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-3 text-sm focus:border-primary outline-none transition-all h-20 resize-none" />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="font-label text-[10px] uppercase tracking-widest text-tertiary">Objetivos</label>
              <textarea value={formData.goals} placeholder="Ej: Bajar de peso, ganar masa muscular..."
                onChange={e => setFormData({ ...formData, goals: e.target.value })}
                className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-3 text-sm focus:border-primary outline-none transition-all h-24 resize-none" />
            </div>

            <div className="flex items-center gap-4 md:col-span-2 pt-4">
              <button type="submit" disabled={loading}
                className="flex-1 bg-primary text-on-primary py-4 rounded-2xl font-headline font-black italic uppercase tracking-tighter hover:bg-primary/90 transition-all disabled:opacity-50">
                {uploadingPhoto ? 'Subiendo foto...' : loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button type="button" onClick={() => { setIsEditing(false); setPhotoPreview(photoURL); setPhotoFile(null); }}
                className="px-8 py-4 border border-outline-variant/30 text-tertiary rounded-2xl font-headline font-bold uppercase tracking-tight hover:bg-surface-container-high transition-all">
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Avatar de perfil en modo lectura */}
            <div className="md:col-span-3 flex items-center gap-5 p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
              <ProfileAvatar name={`${profile.firstName} ${profile.lastName}`} photoURL={profile.photoURL} size={72} />
              <div>
                <p className="font-headline font-black text-xl uppercase tracking-tight">{profile.firstName} {profile.lastName}</p>
                <p className="text-sm text-tertiary mt-1">{profile.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">phone</span>
              </div>
              <div>
                <p className="font-label text-[10px] uppercase tracking-widest text-tertiary">Teléfono</p>
                <p className="font-headline font-bold text-sm uppercase">{profile.phone || '—'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">wc</span>
              </div>
              <div>
                <p className="font-label text-[10px] uppercase tracking-widest text-tertiary">Sexo</p>
                <p className="font-headline font-bold text-sm uppercase">{profile.gender || 'Otro'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">height</span>
              </div>
              <div>
                <p className="font-label text-[10px] uppercase tracking-widest text-tertiary">Altura</p>
                <p className="font-headline font-bold text-sm uppercase">{profile.height || 0} CM</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">weight</span>
              </div>
              <div>
                <p className="font-label text-[10px] uppercase tracking-widest text-tertiary">Peso Actual</p>
                <p className="font-headline font-bold text-sm uppercase">{profile.weight || 0} KG</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">fitness_center</span>
              </div>
              <div>
                <p className="font-label text-[10px] uppercase tracking-widest text-tertiary">Meta Semanal</p>
                <p className="font-headline font-bold text-sm uppercase">{profile.weeklyTrainingGoal || 3} DÍAS</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">sports_score</span>
              </div>
              <div>
                <p className="font-label text-[10px] uppercase tracking-widest text-tertiary">Nivel de Condición</p>
                <p className="font-headline font-bold text-sm uppercase">{profile.fitnessLevel || 'Principiante'}</p>
              </div>
            </div>

            <div className="md:col-span-3 p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <p className="font-label text-[10px] uppercase tracking-widest text-tertiary mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs">flag</span>Objetivos
                </p>
                <p className="font-body text-sm text-tertiary leading-relaxed italic">{profile.goals || 'Sin objetivos definidos.'}</p>
              </div>
              <div className="flex-1">
                <p className="font-label text-[10px] uppercase tracking-widest text-tertiary mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs">sports_handball</span>Otros Deportes
                </p>
                <p className="font-body text-sm text-tertiary leading-relaxed italic">{profile.otherSports || 'No práctica otros deportes.'}</p>
              </div>
              <div className="flex-1">
                <p className="font-label text-[10px] uppercase tracking-widest text-tertiary mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs">medical_services</span>Salud
                </p>
                <p className="font-body text-sm text-tertiary leading-relaxed italic">{profile.healthObservations || 'Sin observaciones de salud.'}</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Membership Card */}
      <section className="relative overflow-hidden bg-gradient-primary p-8 rounded-[2.5rem] shadow-glow min-h-[220px] flex flex-col justify-between">
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-headline font-black italic text-2xl text-on-primary-container tracking-tighter uppercase">GYM DE LA COSTA</p>
              <p className="font-label text-[10px] font-black uppercase text-on-primary-container/60 tracking-widest">Socio Activo</p>
            </div>
            <span className="material-symbols-outlined text-4xl text-on-primary-container icon-fill">stars</span>
          </div>
        </div>
        <div className="relative z-10 flex justify-between items-end">
          <div>
            <p className="font-label text-[10px] uppercase text-on-primary-container/60 mb-1">DNI del Socio</p>
            <p className="font-headline font-bold text-lg text-on-primary-container">{profile.dni || 'NO REGISTRADO'}</p>
          </div>
          <div className="text-right">
            <p className="font-label text-[10px] uppercase text-on-primary-container/60 mb-1">Miembro desde</p>
            <p className="font-headline font-bold text-lg text-on-primary-container">
              {profile.createdAt
                ? new Date(profile.createdAt.toDate ? profile.createdAt.toDate() : profile.createdAt).toLocaleDateString()
                : '---'}
            </p>
          </div>
        </div>
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        </div>
      </section>
    </div>
  );
}
