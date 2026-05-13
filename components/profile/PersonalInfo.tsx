'use client';
import { useState } from 'react';
import { UserProfile, userService } from '@/services/user.service';
import { motion } from 'motion/react';

export default function PersonalInfo({ profile }: { profile: UserProfile & { id: string } }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    weight: profile.weight || 0,
    goals: profile.goals || '',
    weeklyTrainingGoal: profile.weeklyTrainingGoal || 3,
    currentPlan: profile.currentPlan || 'Básico',
    medicalHistory: profile.medicalHistory || '',
    priorExperience: profile.priorExperience || '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      await userService.updatePersonalInfo(profile.id, formData);
      setSuccess(true);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
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
            <div className="flex flex-col gap-2">
              <label className="font-label text-[10px] uppercase tracking-widest text-tertiary">Nombre</label>
              <input 
                type="text" 
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-3 text-sm focus:border-primary outline-none transition-all"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-label text-[10px] uppercase tracking-widest text-tertiary">Apellido</label>
              <input 
                type="text" 
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-3 text-sm focus:border-primary outline-none transition-all"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-label text-[10px] uppercase tracking-widest text-tertiary">Peso (kg)</label>
              <input 
                type="number" 
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: Number(e.target.value)})}
                className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-3 text-sm focus:border-primary outline-none transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-label text-[10px] uppercase tracking-widest text-tertiary">Meta Semanal (días)</label>
              <input 
                type="number" 
                min="1"
                max="7"
                value={formData.weeklyTrainingGoal}
                onChange={(e) => setFormData({...formData, weeklyTrainingGoal: Number(e.target.value)})}
                className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-3 text-sm focus:border-primary outline-none transition-all"
              />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="font-label text-[10px] uppercase tracking-widest text-tertiary">Historial Médico</label>
              <textarea 
                value={formData.medicalHistory}
                onChange={(e) => setFormData({...formData, medicalHistory: e.target.value})}
                className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-3 text-sm focus:border-primary outline-none transition-all h-20 resize-none"
                placeholder="Ej: Lesiones, asma, problemas cardíacos..."
              />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="font-label text-[10px] uppercase tracking-widest text-tertiary">Experiencia Previa</label>
              <textarea 
                value={formData.priorExperience}
                onChange={(e) => setFormData({...formData, priorExperience: e.target.value})}
                className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-3 text-sm focus:border-primary outline-none transition-all h-20 resize-none"
                placeholder="Ej: 2 años de musculación, crossfit..."
              />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="font-label text-[10px] uppercase tracking-widest text-tertiary">Objetivos</label>
              <textarea 
                value={formData.goals}
                onChange={(e) => setFormData({...formData, goals: e.target.value})}
                className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-3 text-sm focus:border-primary outline-none transition-all h-20 resize-none"
                placeholder="Ej: Bajar de peso, ganar masa muscular..."
              />
            </div>
            <div className="flex items-center gap-4 md:col-span-2 pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 bg-primary text-on-primary py-4 rounded-2xl font-headline font-black italic uppercase tracking-tighter hover:bg-primary/90 transition-all disabled:opacity-50 shadow-glow"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className="px-8 py-4 border border-outline-variant/30 text-tertiary rounded-2xl font-headline font-bold uppercase tracking-tight hover:bg-surface-container-high transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">badge</span>
                </div>
                <div>
                  <p className="font-label text-[10px] uppercase tracking-widest text-tertiary">Nombre Completo</p>
                  <p className="font-headline font-bold text-sm uppercase">{profile.firstName} {profile.lastName}</p>
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
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">event_repeat</span>
                </div>
                <div>
                  <p className="font-label text-[10px] uppercase tracking-widest text-tertiary">Meta Semanal</p>
                  <p className="font-headline font-bold text-sm uppercase">{profile.weeklyTrainingGoal || 3} DÍAS / SEMANA</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">card_membership</span>
                </div>
                <div>
                  <p className="font-label text-[10px] uppercase tracking-widest text-tertiary">Plan Actual</p>
                  <p className="font-headline font-bold text-sm uppercase">{profile.currentPlan || 'Básico'}</p>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
                 <p className="font-label text-[10px] uppercase tracking-widest text-tertiary mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs">medical_services</span>
                  Historial Médico
                 </p>
                 <p className="font-body text-sm text-tertiary leading-relaxed italic">
                  {profile.medicalHistory || 'Sin datos registrados.'}
                 </p>
              </div>
              <div className="p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
                 <p className="font-label text-[10px] uppercase tracking-widest text-tertiary mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs">history_edu</span>
                  Experiencia Previa
                 </p>
                 <p className="font-body text-sm text-tertiary leading-relaxed italic">
                  {profile.priorExperience || 'Sin datos registrados.'}
                 </p>
              </div>
            </div>

            <div className="md:col-span-2 p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
               <p className="font-label text-[10px] uppercase tracking-widest text-tertiary mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-xs">flag</span>
                Objetivos de Entrenamiento
               </p>
               <p className="font-body text-sm text-tertiary leading-relaxed italic">
                {profile.goals || 'Sin objetivos definidos.'}
               </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
