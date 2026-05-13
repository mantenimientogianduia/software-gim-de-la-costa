'use client';
import { useState } from 'react';
import { UserProfile } from '@/services/user.service';
import StudentDirectory from '@/components/profesor/StudentDirectory';
import StudentDetailView from '@/components/profesor/StudentDetailView';

export default function ProfesorDashboard({ profile }: { profile: UserProfile & { id: string } }) {
  const [selectedStudent, setSelectedStudent] = useState<(UserProfile & { id: string }) | null>(null);

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col md:flex-row">
      {/* Sidebar for Desktop / Bottom Nav for Mobile */}
      <aside className="w-full md:w-64 bg-surface-container-low ghost-border md:h-screen sticky top-0 flex flex-col items-center py-8">
        <div className="px-6 mb-12">
          <h1 className="font-headline font-black italic text-2xl text-primary tracking-tighter uppercase">PROFESOR</h1>
          <p className="font-label text-[10px] uppercase tracking-widest text-tertiary">Panel de Gestión</p>
        </div>

        <nav className="flex flex-col w-full">
          <button 
            onClick={() => setSelectedStudent(null)}
            className={`flex items-center gap-4 px-6 py-4 transition-all ${!selectedStudent ? 'bg-surface-container-high text-primary-container border-l-4 border-primary-container' : 'text-tertiary hover:bg-surface-container-high hover:text-white'}`}
          >
            <span className={`material-symbols-outlined ${!selectedStudent ? 'icon-fill' : ''}`}>group</span>
            <span className="font-label font-bold uppercase text-sm">Directorio de Socios</span>
          </button>
        </nav>

        <div className="mt-auto px-6 pt-8 w-full border-t border-outline-variant/10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined icon-fill">account_circle</span>
             </div>
             <div>
                <p className="font-label font-bold text-xs uppercase truncate max-w-[120px]">{profile.firstName}</p>
                <p className="font-label text-[10px] text-tertiary uppercase">Staff</p>
             </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {selectedStudent ? (
            <StudentDetailView 
              student={selectedStudent} 
              onBack={() => setSelectedStudent(null)} 
            />
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
               <div className="mb-8">
                 <h2 className="font-headline font-black italic text-4xl text-primary tracking-tighter uppercase leading-tight">Socios</h2>
                 <p className="font-body text-tertiary">Consulta el legajo, racha y objetivos de tus alumnos.</p>
               </div>
               <StudentDirectory onSelectStudent={setSelectedStudent} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
