'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { classService, GymClass } from '@/services/class.service';
import { useClasses } from '@/hooks/use-classes';
import { Timestamp } from 'firebase/firestore';
import WeeklyCalendar from '@/components/classes/WeeklyCalendar';

export default function ClassScheduler({ instructorId }: { instructorId: string }) {
  const { classes, loading, refreshClasses } = useClasses();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('calendar');
  const [isRecurring, setIsRecurring] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    capacity: 20,
    date: '',
    time: '',
    duration: 60,
    weeksCount: 4,
    days: [] as number[],
  });

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const daysOfWeek = [
    { label: 'Lun', value: 1 },
    { label: 'Mar', value: 2 },
    { label: 'Mié', value: 3 },
    { label: 'Jue', value: 4 },
    { label: 'Vie', value: 5 },
    { label: 'Sáb', value: 6 },
    { label: 'Dom', value: 0 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRecurring && formData.days.length === 0) {
      showToast('Seleccioná al menos un día para la recurrencia.', 'err');
      return;
    }
    setSubmitting(true);
    try {
      if (isRecurring) {
        await classService.createRecurringClasses({
          title: formData.title,
          instructorId,
          capacity: Number(formData.capacity),
          status: 'active',
        }, {
          days: formData.days,
          startTimeStr: formData.time,
          durationMin: Number(formData.duration),
        }, formData.weeksCount);
        showToast(`Cronograma de ${formData.weeksCount} semanas creado.`, 'ok');
      } else {
        const start = new Date(`${formData.date}T${formData.time}`);
        const end = new Date(start.getTime() + Number(formData.duration) * 60 * 1000);
        await classService.createClass({
          title: formData.title,
          instructorId,
          startTime: Timestamp.fromDate(start),
          endTime: Timestamp.fromDate(end),
          capacity: Number(formData.capacity),
          status: 'active',
        });
        showToast('Clase publicada con éxito.', 'ok');
      }
      setIsFormOpen(false);
      setFormData({ title: '', capacity: 20, date: '', time: '', duration: 60, weeksCount: 4, days: [] });
      refreshClasses();
    } catch (err) {
      console.error(err);
      showToast('Error al publicar la clase. Intentá de nuevo.', 'err');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelClass = async (classId: string) => {
    setCancellingId(classId);
    try {
      await classService.cancelClass(classId);
      refreshClasses();
      showToast('Clase cancelada.', 'ok');
    } catch {
      showToast('Error al cancelar la clase.', 'err');
    } finally {
      setCancellingId(null);
      setConfirmCancelId(null);
    }
  };

  const toggleDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day],
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl font-label text-sm font-bold uppercase tracking-widest ${
              toast.type === 'ok'
                ? 'bg-green-500/20 border border-green-500/40 text-green-300'
                : 'bg-error/20 border border-error/40 text-error'
            }`}
          >
            <span className="material-symbols-outlined text-lg">
              {toast.type === 'ok' ? 'check_circle' : 'error'}
            </span>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-6">
          <h2 className="font-headline text-2xl font-bold uppercase tracking-tight">Agenda de Clases</h2>
          <div className="flex bg-surface-container-low p-1 rounded-sm gap-1 border border-outline-variant/10">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-2 px-4 py-2 font-label text-[10px] uppercase tracking-widest rounded-sm transition-all ${viewMode === 'calendar' ? 'bg-primary text-on-primary font-bold shadow-md' : 'text-tertiary hover:text-white'}`}
            >
              <span className="material-symbols-outlined text-sm">calendar_view_week</span>
              Calendario
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-4 py-2 font-label text-[10px] uppercase tracking-widest rounded-sm transition-all ${viewMode === 'grid' ? 'bg-primary text-on-primary font-bold shadow-md' : 'text-tertiary hover:text-white'}`}
            >
              <span className="material-symbols-outlined text-sm">grid_view</span>
              Cuadrícula
            </button>
          </div>
        </div>
        <button
          onClick={() => setIsFormOpen(v => !v)}
          className="bg-primary text-on-primary font-label text-sm font-bold uppercase tracking-widest px-6 py-3 rounded-sm hover:scale-105 active:scale-95 transition-all"
        >
          {isFormOpen ? 'Cerrar' : 'Crear Clase'}
        </button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="bg-surface-container-high p-8 rounded-lg shadow-2xl ghost-border"
          >
            <div className="flex bg-surface-container-low p-1 rounded-sm gap-1 mb-8 max-w-xs">
              <button
                type="button"
                onClick={() => setIsRecurring(false)}
                className={`flex-1 py-2 font-label text-[10px] uppercase tracking-widest rounded-sm transition-all ${!isRecurring ? 'bg-primary text-on-primary font-bold shadow-md' : 'text-tertiary hover:text-white'}`}
              >
                Individual
              </button>
              <button
                type="button"
                onClick={() => setIsRecurring(true)}
                className={`flex-1 py-2 font-label text-[10px] uppercase tracking-widest rounded-sm transition-all ${isRecurring ? 'bg-primary text-on-primary font-bold shadow-md' : 'text-tertiary hover:text-white'}`}
              >
                Recurrente
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="font-label text-[9px] uppercase tracking-widest text-tertiary block mb-2">Título de la clase</label>
                <input
                  required
                  placeholder="Ej: Crossfit Nivel 2, Funcional, Yoga..."
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-surface-container-low p-4 font-body border-b-2 border-surface-container-highest outline-none focus:border-primary uppercase text-sm"
                />
              </div>
              {!isRecurring && (
                <div>
                  <label className="font-label text-[9px] uppercase tracking-widest text-tertiary block mb-2">Fecha</label>
                  <input
                    required
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-surface-container-low p-4 font-body border-b-2 border-surface-container-highest outline-none focus:border-primary"
                  />
                </div>
              )}
              <div>
                <label className="font-label text-[9px] uppercase tracking-widest text-tertiary block mb-2">Horario</label>
                <input
                  required
                  type="time"
                  value={formData.time}
                  onChange={e => setFormData({ ...formData, time: e.target.value })}
                  className="w-full bg-surface-container-low p-4 font-body border-b-2 border-surface-container-highest outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="font-label text-[9px] uppercase tracking-widest text-tertiary block mb-2">Duración (minutos)</label>
                <input
                  required
                  type="number"
                  min="15"
                  max="180"
                  value={formData.duration}
                  onChange={e => setFormData({ ...formData, duration: Number(e.target.value) })}
                  className="w-full bg-surface-container-low p-4 font-body border-b-2 border-surface-container-highest outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="font-label text-[9px] uppercase tracking-widest text-tertiary block mb-2">Cupo máximo</label>
                <input
                  required
                  type="number"
                  min="1"
                  placeholder="20"
                  value={formData.capacity}
                  onChange={e => setFormData({ ...formData, capacity: Number(e.target.value) })}
                  className="w-full bg-surface-container-low p-4 font-body border-b-2 border-surface-container-highest outline-none focus:border-primary"
                />
              </div>
              {isRecurring && (
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <label className="font-label text-[9px] uppercase tracking-widest text-tertiary block mb-3">Días de la semana</label>
                    <div className="flex flex-wrap gap-3">
                      {daysOfWeek.map((day, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => toggleDay(day.value)}
                          className={`px-4 h-10 rounded-lg font-label text-[10px] font-bold uppercase tracking-widest transition-all border ${formData.days.includes(day.value) ? 'bg-primary text-white border-primary shadow-glow' : 'bg-surface-container-low text-tertiary border-outline-variant/10 hover:border-primary/50'}`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-label text-xs uppercase tracking-widest text-tertiary">Semanas a generar:</span>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={formData.weeksCount}
                      onChange={e => setFormData({ ...formData, weeksCount: Number(e.target.value) })}
                      className="bg-surface-container-low p-2 w-20 rounded font-mono text-sm text-center outline-none border border-outline-variant/10"
                    />
                  </div>
                </div>
              )}
              <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                <button type="button" onClick={() => setIsFormOpen(false)} className="font-label text-xs uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity px-6">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-primary text-on-primary font-label text-xs font-bold uppercase tracking-widest px-10 py-4 rounded-sm shadow-glow disabled:opacity-60"
                >
                  {submitting ? 'Publicando...' : isRecurring ? 'Generar Cronograma' : 'Publicar Clase'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Class list */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface-container-low p-6 rounded-lg ghost-border animate-pulse h-36" />
          ))}
        </div>
      ) : viewMode === 'calendar' ? (
        <WeeklyCalendar classes={classes} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map(c => {
            const start = c.startTime.toDate();
            const end = c.endTime?.toDate?.();
            const durationMin = end ? Math.round((end.getTime() - start.getTime()) / 60000) : null;
            const spotsLeft = c.capacity - c.enrolledCount;
            const isFull = spotsLeft <= 0;
            const isConfirmingCancel = confirmCancelId === c.id;

            return (
              <div key={c.id} className="bg-surface-container-low p-6 rounded-lg ghost-border relative overflow-hidden group">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-headline font-bold text-lg uppercase tracking-tight">{c.title}</h4>
                  <div className={`px-2 py-1 rounded font-label text-[9px] uppercase font-black ${isFull ? 'bg-error/20 text-error' : 'bg-primary/20 text-primary'}`}>
                    {c.enrolledCount} / {c.capacity}
                  </div>
                </div>
                <div className="space-y-1 mb-4">
                  <p className="font-label text-xs text-tertiary uppercase tracking-widest">
                    {start.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}
                  </p>
                  <p className="font-label text-xs font-black uppercase tracking-widest">
                    {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hs
                    {durationMin ? ` · ${durationMin} min` : ''}
                  </p>
                  {!isFull && (
                    <p className="font-label text-[9px] text-green-400 uppercase tracking-widest">
                      {spotsLeft} {spotsLeft === 1 ? 'lugar libre' : 'lugares libres'}
                    </p>
                  )}
                </div>

                {/* Cancel controls */}
                <div className={`pt-4 border-t border-outline-variant/15 transition-all ${isConfirmingCancel ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  {isConfirmingCancel ? (
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-label text-[9px] text-error uppercase tracking-widest">¿Confirmar cancelación?</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmCancelId(null)}
                          className="font-label text-[9px] uppercase tracking-widest text-tertiary hover:text-white transition-colors px-3 py-1.5"
                        >
                          No
                        </button>
                        <button
                          onClick={() => handleCancelClass(c.id!)}
                          disabled={cancellingId === c.id}
                          className="font-label text-[9px] uppercase tracking-widest text-error hover:bg-error/10 px-3 py-1.5 rounded transition-colors disabled:opacity-50"
                        >
                          {cancellingId === c.id ? 'Cancelando...' : 'Sí, cancelar'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmCancelId(c.id!)}
                      className="text-error font-label text-[10px] uppercase font-bold hover:underline"
                    >
                      Cancelar clase
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {classes.length === 0 && (
            <div className="col-span-full py-24 text-center bg-surface-container-lowest rounded-lg border-2 border-dashed border-outline-variant/20">
              <span className="material-symbols-outlined text-4xl mb-4 opacity-20">calendar_month</span>
              <p className="font-label uppercase tracking-widest opacity-50">No hay clases publicadas</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
