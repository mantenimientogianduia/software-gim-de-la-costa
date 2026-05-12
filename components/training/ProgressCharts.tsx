'use client';
import { useMemo, useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { progressService, ExercisePR } from '@/services/progress.service';
import { motion, AnimatePresence } from 'framer-motion';

interface ProgressChartsProps {
  userId: string;
}

export default function ProgressCharts({ userId }: ProgressChartsProps) {
  const [prs, setPrs] = useState<ExercisePR[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  useEffect(() => {
    fetchPrs();
  }, [userId]);

  const fetchPrs = async () => {
    try {
      const data = await progressService.getUserPRs(userId);
      setPrs(data);
      if (data.length > 0 && !selectedExercise) {
        setSelectedExercise(data[0].exerciseId);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const exerciseOptions = useMemo(() => {
    const unique = new Map<string, string>();
    prs.forEach(p => unique.set(p.exerciseId, p.exerciseName));
    return Array.from(unique.entries());
  }, [prs]);

  const chartData = useMemo(() => {
    if (!selectedExercise) return [];
    return prs
      .filter(p => p.exerciseId === selectedExercise)
      .sort((a, b) => a.date?.toDate?.() - b.date?.toDate?.())
      .map(p => ({
        date: p.date?.toDate?.().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) || '-',
        weight: p.weight,
        reps: p.reps
      }));
  }, [prs, selectedExercise]);

  const currentStats = useMemo(() => {
    if (!selectedExercise) return null;
    const history = prs.filter(p => p.exerciseId === selectedExercise);
    if (history.length === 0) return null;
    
    const sorted = [...history].sort((a,b) => b.date?.toDate?.() - a.date?.toDate?.());
    const latest = sorted[0];
    const prev = sorted[1];
    
    const diff = prev ? latest.weight - prev.weight : 0;
    
    return {
      latest,
      diff,
      exerciseName: latest.exerciseName
    };
  }, [prs, selectedExercise]);

  if (loading) return <div className="h-64 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  if (prs.length === 0) return null;

  return (
    <div className="bg-surface-container-low rounded-[2rem] p-8 ghost-border space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="font-headline font-black text-2xl uppercase tracking-tighter italic">Evolución de Fuerza</h3>
          <p className="font-label text-[10px] uppercase tracking-widest text-tertiary">Seguimiento de récords personales</p>
        </div>
        
        <select 
          value={selectedExercise || ''} 
          onChange={(e) => setSelectedExercise(e.target.value)}
          className="bg-surface-container-high px-6 py-3 rounded-xl font-label text-[10px] uppercase font-bold tracking-widest outline-none border border-outline-variant/20 hover:border-primary transition-colors cursor-pointer"
        >
          {exerciseOptions.map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
      </div>

      <AnimatePresence mode="wait">
        {currentStats && (
          <motion.div 
            key={selectedExercise}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="bg-surface-container-highest/30 p-6 rounded-2xl border border-white/5">
              <p className="font-label text-[10px] uppercase tracking-widest text-tertiary mb-2">Máximo Actual</p>
              <div className="flex items-baseline gap-2">
                <h4 className="font-headline text-4xl font-black text-primary italic drop-shadow-glow">{currentStats.latest.weight}</h4>
                <span className="font-label text-sm uppercase text-tertiary">KG</span>
              </div>
            </div>
            <div className="bg-surface-container-highest/30 p-6 rounded-2xl border border-white/5">
              <p className="font-label text-[10px] uppercase tracking-widest text-tertiary mb-2">Mejora</p>
              <div className="flex items-baseline gap-2">
                <h4 className={`font-headline text-4xl font-black italic ${currentStats.diff > 0 ? 'text-green-500' : 'text-tertiary'}`}>
                  {currentStats.diff > 0 ? `+${currentStats.diff}` : currentStats.diff}
                </h4>
                <span className="font-label text-sm uppercase text-tertiary">KG</span>
              </div>
            </div>
            <div className="bg-surface-container-highest/30 p-6 rounded-2xl border border-white/5">
              <p className="font-label text-[10px] uppercase tracking-widest text-tertiary mb-2">Repeticiones</p>
              <div className="flex items-baseline gap-2">
                <h4 className="font-headline text-4xl font-black italic">{currentStats.latest.reps}</h4>
                <span className="font-label text-sm uppercase text-tertiary">REPS</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-[300px] w-full mt-8">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff5722" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ff5722" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#888', fontSize: 10, fontWeight: 700 }}
              dy={15}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#888', fontSize: 10 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1E1E1E', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                fontFamily: 'Inter, sans-serif'
              }}
              itemStyle={{ color: '#ff5722', fontSize: '12px', fontWeight: 800 }}
            />
            <Area 
              type="monotone" 
              dataKey="weight" 
              stroke="#ff5722" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorWeight)" 
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
