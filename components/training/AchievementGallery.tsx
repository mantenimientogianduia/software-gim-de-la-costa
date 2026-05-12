'use client';
import { motion } from 'framer-motion';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'progress' | 'consistency';
}

const ALL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_workout', title: 'Primer Paso', description: 'Completaste tu primer entrenamiento.', icon: 'rocket_launch', category: 'consistency' },
  { id: 'streak_3', title: 'Triplete', description: 'Entrenaste 3 días seguidos.', icon: 'local_fire_department', category: 'streak' },
  { id: 'streak_7', title: 'Semana Perfecta', description: 'Entrenaste 7 días seguidos.', icon: 'workspace_premium', category: 'streak' },
  { id: 'pr_crusher', title: 'Rompe-Límites', description: 'Superaste un récord personal de fuerza.', icon: 'bolt', category: 'progress' },
  { id: 'early_bird', title: 'Madrugador', description: 'Entrenaste antes de las 8:00 AM.', icon: 'wb_sunny', category: 'consistency' },
  { id: 'night_owl', title: 'Lobo Nocturno', description: 'Entrenaste después de las 9:00 PM.', icon: 'dark_mode', category: 'consistency' },
];

interface AchievementGalleryProps {
  unlockedList: string[];
}

export default function AchievementGallery({ unlockedList }: AchievementGalleryProps) {
  return (
    <div className="bg-surface-container-low rounded-[2rem] p-8 ghost-border space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-headline font-black text-2xl uppercase tracking-tighter italic">Logros & Medallas</h3>
          <p className="font-label text-[10px] uppercase tracking-widest text-tertiary">Tu camino a la gloria</p>
        </div>
        <div className="bg-primary/20 text-primary px-4 py-2 rounded-xl flex items-center gap-2">
           <span className="font-headline text-lg font-black italic">{unlockedList?.length || 0}</span>
           <span className="material-symbols-outlined text-sm">emoji_events</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {ALL_ACHIEVEMENTS.map((ach) => {
          const isUnlocked = unlockedList?.includes(ach.id);
          return (
            <motion.div 
              key={ach.id}
              whileHover={isUnlocked ? { scale: 1.05 } : {}}
              className={`p-6 rounded-3xl flex flex-col items-center gap-4 text-center transition-all border ${
                isUnlocked 
                  ? 'bg-surface-container-high border-primary/20 shadow-glow text-on-surface' 
                  : 'bg-surface-container-lowest/50 border-white/5 opacity-40 grayscale'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                isUnlocked ? 'bg-primary text-white shadow-glow-error translate-y-[-4px]' : 'bg-surface-container-highest text-tertiary'
              }`}>
                <span className="material-symbols-outlined text-3xl font-black">{ach.icon}</span>
              </div>
              <div>
                <h4 className="font-headline text-[11px] font-black uppercase tracking-tight leading-tight">{ach.title}</h4>
                <p className="text-[9px] font-body text-tertiary italic mt-1 leading-tight">{ach.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
