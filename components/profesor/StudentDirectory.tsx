'use client';
import { useState, useEffect } from 'react';
import { userService, UserProfile } from '@/services/user.service';
import { motion, AnimatePresence } from 'motion/react';

export default function StudentDirectory({ onSelectStudent }: { onSelectStudent: (student: UserProfile & { id: string }) => void }) {
  const [students, setStudents] = useState<(UserProfile & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadStudents() {
      try {
        const data = await userService.getAllUsers();
        // Filter to only show members/students
        setStudents(data.filter(u => u.role === 'socio'));
      } catch (error) {
        console.error('Error loading students:', error);
      } finally {
        setLoading(false);
      }
    }
    loadStudents();
  }, []);

  const filteredStudents = students.filter(s => 
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.dni?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-tertiary">search</span>
        <input 
          type="text" 
          placeholder="Buscar socio por nombre, email o DNI..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-primary/50 transition-all font-body text-sm shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredStudents.map((student) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={student.id}
              onClick={() => onSelectStudent(student)}
              className="bg-surface-container-low p-5 rounded-2xl ghost-border hover:border-primary/40 transition-all cursor-pointer group flex items-center gap-4 shadow-sm hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                <span className="material-symbols-outlined">person</span>
              </div>
              <div className="flex-1">
                <p className="font-headline font-bold text-sm uppercase tracking-tight truncate">
                  {student.firstName} {student.lastName}
                </p>
                <p className="font-label text-[10px] text-tertiary/60 truncate uppercase tracking-widest">
                  {student.email}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-2 h-2 rounded-full ${student.atGym ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-tertiary/30'}`} />
                  <span className="font-label text-[8px] uppercase tracking-widest text-tertiary">
                    {student.atGym ? 'En el gimnasio' : 'Ausente'}
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-tertiary group-hover:translate-x-1 transition-transform">chevron_right</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12 bg-surface-container-low rounded-3xl border-2 border-dashed border-outline-variant/10">
          <p className="font-body text-tertiary italic">No se encontraron socios que coincidan con la búsqueda.</p>
        </div>
      )}
    </div>
  );
}
