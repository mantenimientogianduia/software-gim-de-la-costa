'use client';
import { useState, useMemo } from 'react';
import { GymClass } from '@/services/class.service';
import { motion, AnimatePresence } from 'motion/react';

interface WeeklyCalendarProps {
  classes: GymClass[];
  onClassClick?: (gymClass: GymClass) => void;
}

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6:00 to 22:00
const DAYS = [
  { name: 'Lun', value: 1 },
  { name: 'Mar', value: 2 },
  { name: 'Mié', value: 3 },
  { name: 'Jue', value: 4 },
  { name: 'Vie', value: 5 },
  { name: 'Sáb', value: 6 },
  { name: 'Dom', value: 0 },
];

export default function WeeklyCalendar({ classes, onClassClick }: WeeklyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const weekHeading = useMemo(() => {
    const start = new Date(currentDate);
    // Adjust to Monday
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return {
      range: `${start.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`,
      monday: start
    };
  }, [currentDate]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekHeading.monday);
      d.setDate(weekHeading.monday.getDate() + i);
      return d;
    });
  }, [weekHeading.monday]);

  const filteredClasses = useMemo(() => {
    const start = new Date(weekHeading.monday);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);

    return classes.filter(c => {
      const date = c.startTime.toDate ? c.startTime.toDate() : new Date(c.startTime);
      return date >= start && date < end;
    });
  }, [classes, weekHeading.monday]);

  const dynamicHours = useMemo(() => {
    if (filteredClasses.length === 0) return Array.from({ length: 17 }, (_, i) => i + 6);
    
    const earliestHour = Math.min(...filteredClasses.map(c => (c.startTime.toDate ? c.startTime.toDate() : new Date(c.startTime)).getHours()));
    const latestHour = Math.max(...filteredClasses.map(c => {
      const start = c.startTime.toDate ? c.startTime.toDate() : new Date(c.startTime);
      const end = c.endTime?.toDate ? c.endTime.toDate() : new Date(start.getTime() + 60 * 60 * 1000);
      return end.getHours();
    }));

    const startHour = earliestHour >= 12 ? 11 : 6;
    const endHour = Math.max(20, latestHour + 1);

    const length = endHour - startHour + 1;
    return Array.from({ length }, (_, i) => i + startHour);
  }, [filteredClasses]);

  const startHour = dynamicHours[0];

  const changeWeek = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + offset * 7);
    setCurrentDate(newDate);
  };

  const getPositionStyles = (gymClass: GymClass) => {
    const date = gymClass.startTime.toDate ? gymClass.startTime.toDate() : new Date(gymClass.startTime);
    const currentHour = date.getHours();
    const startMinutes = date.getMinutes();
    
    // Rows are 60px high
    const top = (currentHour - startHour) * 60 + (startMinutes / 60) * 60;
    
    // Assume 1 hour duration if not specified
    const end = gymClass.endTime?.toDate ? gymClass.endTime.toDate() : new Date(date.getTime() + 60 * 60 * 1000);
    const durationHours = (end.getTime() - date.getTime()) / (1000 * 60 * 60);
    const height = durationHours * 60;

    return {
      top: `${top}px`,
      height: `${height}px`,
    };
  };

  return (
    <div className="bg-surface-container-low rounded-3xl ghost-border overflow-hidden flex flex-col h-[800px] animate-in fade-in zoom-in-95 duration-500">
      {/* Calendar Header */}
      <div className="p-6 border-b border-outline-variant/15 flex justify-between items-center bg-surface-container-high/50">
        <div className="flex items-center gap-6">
           <h3 className="font-headline text-xl font-black uppercase tracking-tighter text-primaryitalic">{weekHeading.range}</h3>
           <div className="flex bg-surface-container-lowest rounded-lg p-1 border border-outline-variant/10">
              <button 
                onClick={() => changeWeek(-1)}
                className="p-2 hover:bg-surface-container-high rounded transition-colors material-symbols-outlined text-sm"
              >
                chevron_left
              </button>
              <button 
                onClick={() => setCurrentDate(new Date())}
                className="px-4 font-label text-[10px] uppercase font-bold tracking-widest hover:text-primary transition-colors"
              >
                Hoy
              </button>
              <button 
                onClick={() => changeWeek(1)}
                className="p-2 hover:bg-surface-container-high rounded transition-colors material-symbols-outlined text-sm"
              >
                chevron_right
              </button>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto relative">
        <div className="min-w-[800px]">
          {/* Header Row: Days */}
          <div className="grid grid-cols-[80px_repeat(7,1fr)] sticky top-0 bg-surface-container-low z-20 border-b border-outline-variant/15">
            <div className="h-16 border-r border-outline-variant/10"></div>
            {weekDays.map((day, i) => {
              const isToday = day.toDateString() === new Date().toDateString();
              return (
                <div key={i} className={`h-16 flex flex-col items-center justify-center border-r border-outline-variant/10 ${isToday ? 'bg-primary/5' : ''}`}>
                  <span className="font-label text-[10px] uppercase tracking-widest text-tertiary mb-1">{DAYS[(i + 1) % 7].name}</span>
                  <span className={`font-headline text-xl font-black ${isToday ? 'text-primary' : ''}`}>{day.getDate()}</span>
                </div>
              );
            })}
          </div>

          {/* Grid Body */}
          <div className="grid grid-cols-[80px_repeat(7,1fr)] relative">
            {/* Time Indicators (Column 0) */}
            <div className="flex flex-col">
              {dynamicHours.map(hour => (
                <div key={hour} className="h-[60px] border-r border-outline-variant/10 border-b border-outline-variant/5 relative">
                  <span className="absolute -top-2 right-3 font-mono text-[10px] text-tertiary opacity-50">{hour}:00</span>
                </div>
              ))}
            </div>

            {/* Grid Cells */}
            {Array.from({ length: 7 }).map((_, colIdx) => (
              <div key={colIdx} className="relative border-r border-outline-variant/10 bg-grid-white/[0.02]">
                {dynamicHours.map(hour => (
                  <div key={hour} className="h-[60px] border-b border-outline-variant/5"></div>
                ))}
                
                {/* Classes in this day */}
                <AnimatePresence>
                  {filteredClasses
                    .filter(c => {
                      const d = c.startTime.toDate ? c.startTime.toDate() : new Date(c.startTime);
                      const dayOfWeek = d.getDay();
                      const targetIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                      return targetIdx === colIdx;
                    })
                    .map(c => (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        whileHover={{ scale: 1.02, zIndex: 10 }}
                        onClick={() => onClassClick?.(c)}
                        style={getPositionStyles(c)}
                        className="absolute left-1 right-1 bg-primary text-on-primary rounded-lg shadow-glow-error p-3 cursor-pointer overflow-hidden border border-white/20 backdrop-blur-sm group"
                      >
                        <div className="flex flex-col h-full">
                           <h4 className="font-headline text-[11px] font-black uppercase leading-tight truncate mb-1">{c.title}</h4>
                           <div className="flex items-center gap-2 mt-auto">
                              <span className="material-symbols-outlined text-[10px] opacity-70">person</span>
                              <span className="font-label text-[9px] uppercase tracking-tighter opacity-70">{c.enrolledCount}/{c.capacity}</span>
                           </div>
                        </div>
                      </motion.div>
                    ))
                  }
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
