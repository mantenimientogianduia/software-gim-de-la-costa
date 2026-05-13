'use client';
import { useState, useEffect } from 'react';
import { streakService } from '@/services/streak.service';

export default function AttendanceHistory({ userEmail }: { userEmail: string }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await streakService.getRecentCheckins(userEmail);
        setHistory(data);
      } catch (error) {
        console.error('Error loading history:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userEmail]);

  if (loading) return <div className="animate-pulse space-y-4 pt-4"><div className="h-10 bg-surface-container-highest rounded-xl w-full"></div><div className="h-10 bg-surface-container-highest rounded-xl w-full"></div></div>;

  return (
    <div className="flex flex-col gap-4">
      <h4 className="font-label text-[10px] uppercase tracking-widest text-tertiary mb-2">Visitas Recientes</h4>
      {history.length > 0 ? (
        <div className="space-y-3">
          {history.map((checkin) => (
            <div key={checkin.id} className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-sm">event</span>
                </div>
                <div>
                  <p className="font-headline font-bold text-xs uppercase">
                    {checkin.date?.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}
                  </p>
                  <p className="font-label text-[8px] text-tertiary uppercase">{checkin.activity || 'Entrenamiento General'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-label text-[10px] font-black italic text-primary uppercase">
                   {checkin.date?.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="font-body text-xs text-tertiary italic p-4 bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant/10 text-center">
          No hay registros de asistencia recientes.
        </p>
      )}
    </div>
  );
}
