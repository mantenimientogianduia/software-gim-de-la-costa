'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { userService } from '@/services/user.service';

interface OnboardingFormProps {
  userId: string;
  onComplete: () => void;
}

export default function OnboardingForm({ userId, onComplete }: OnboardingFormProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    age: 25,
    weight: 70,
    height: 175,
    goal: 'Ganar masa muscular',
    experience: 'Intermedio',
    interests: [] as string[]
  });

  const totalSteps = 4;

  const handleNext = () => setStep(s => Math.min(s + 1, totalSteps));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await userService.completeOnboarding(userId, data);
      onComplete();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const goals = [
    'Bajar de peso',
    'Ganar masa muscular',
    'Mejorar fuerza',
    'Mejorar resistencia',
    'Salud general',
    'Rendimiento deportivo'
  ];

  const experiences = ['Principiante', 'Intermedio', 'Avanzado'];
  const interests = ['Musculación', 'Funcional', 'Cardio', 'HIIT', 'Clases grupales', 'Powerlifting', 'Estética'];

  const toggleInterest = (interest: string) => {
    setData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest) 
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-surface flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-white/[0.02] -z-10"></div>
      
      <div className="max-w-xl w-full bg-surface-container-low rounded-[3rem] p-10 ghost-border shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-surface-container-highest">
           <motion.div 
             className="h-full bg-primary shadow-glow"
             initial={{ width: '0%' }}
             animate={{ width: `${(step / totalSteps) * 100}%` }}
           />
        </div>

        <div className="text-center mb-10">
          <p className="font-label text-[10px] uppercase tracking-[0.3em] text-primary font-black mb-2">Paso {step} de {totalSteps}</p>
          <h2 className="font-headline font-black text-3xl uppercase tracking-tighter italic drop-shadow-sm">
            {step === 1 && 'Cuentanos de vos'}
            {step === 2 && '¿Cuál es tu meta?'}
            {step === 3 && 'Tu experiencia'}
            {step === 4 && 'Tus intereses'}
          </h2>
        </div>

        <div className="min-h-[300px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-2">
                    <span className="font-label text-xs uppercase font-bold text-tertiary">Edad</span>
                    <span className="font-headline text-2xl font-black text-primary italic">{data.age}</span>
                  </div>
                  <input type="range" min="15" max="80" value={data.age} onChange={e => setData({...data, age: parseInt(e.target.value)})} className="w-full accent-primary" />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-2">
                    <span className="font-label text-xs uppercase font-bold text-tertiary">Peso (kg)</span>
                    <span className="font-headline text-2xl font-black text-primary italic">{data.weight}</span>
                  </div>
                  <input type="range" min="40" max="150" value={data.weight} onChange={e => setData({...data, weight: parseInt(e.target.value)})} className="w-full accent-primary" />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-2">
                    <span className="font-label text-xs uppercase font-bold text-tertiary">Altura (cm)</span>
                    <span className="font-headline text-2xl font-black text-primary italic">{data.height}</span>
                  </div>
                  <input type="range" min="140" max="220" value={data.height} onChange={e => setData({...data, height: parseInt(e.target.value)})} className="w-full accent-primary" />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="grid grid-cols-1 gap-3"
              >
                {goals.map(g => (
                  <button
                    key={g}
                    onClick={() => setData({...data, goal: g})}
                    className={`p-4 rounded-2xl border text-left font-label text-xs uppercase font-black tracking-widest transition-all ${data.goal === g ? 'bg-primary text-white border-primary shadow-glow' : 'bg-surface-container-high border-white/5 text-tertiary hover:border-primary/50'}`}
                  >
                    {g}
                  </button>
                ))}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="grid grid-cols-1 gap-4"
              >
                {experiences.map(exp => (
                  <button
                    key={exp}
                    onClick={() => setData({...data, experience: exp})}
                    className={`p-6 rounded-3xl border flex flex-col gap-1 transition-all ${data.experience === exp ? 'bg-primary text-white border-primary shadow-glow' : 'bg-surface-container-high border-white/5 text-tertiary hover:border-primary/50'}`}
                  >
                    <span className="font-label text-sm uppercase font-black tracking-widest">{exp}</span>
                  </button>
                ))}
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="grid grid-cols-2 gap-3"
              >
                {interests.map(i => (
                  <button
                    key={i}
                    onClick={() => toggleInterest(i)}
                    className={`p-4 rounded-2xl border text-[10px] uppercase font-black tracking-widest transition-all ${data.interests.includes(i) ? 'bg-primary text-white border-primary shadow-glow' : 'bg-surface-container-high border-white/5 text-tertiary'}`}
                  >
                    {i}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-4 mt-12">
          {step > 1 && (
            <button 
              onClick={handlePrev}
              className="px-8 py-5 rounded-2xl font-label text-xs font-black uppercase tracking-widest text-tertiary border border-outline-variant/20 hover:bg-surface-container-highest transition-all"
            >
              Volver
            </button>
          )}
          <button 
            onClick={step === totalSteps ? handleSubmit : handleNext}
            disabled={loading}
            className="flex-1 bg-gradient-primary text-white py-5 rounded-2xl font-label text-xs font-black uppercase tracking-[0.2em] shadow-glow hover:scale-[1.02] active:scale-95 transition-all"
          >
            {loading ? 'Guardando...' : step === totalSteps ? '¡Empezar!' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  );
}
