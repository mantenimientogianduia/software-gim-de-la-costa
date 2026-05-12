'use client';
import { UserProfile } from '@/services/user.service';

export default function InstructorDashboard({ profile }: { profile: UserProfile }) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
       <header className="mb-16">
          <span className="font-label text-[10px] uppercase tracking-[0.4em] text-primary mb-2 block">Cuerpo Técnico</span>
          <h1 className="font-headline text-6xl font-black uppercase tracking-tighter italic">PANEL INSTRUCTOR</h1>
       </header>
       
       <div className="bg-surface-container-low p-12 rounded-[3rem] ghost-border flex flex-col items-center justify-center text-center">
          <span className="material-symbols-outlined text-6xl text-tertiary mb-8">construction</span>
          <h2 className="font-headline text-3xl font-black uppercase italic mb-4">Herramientas en Desarrollo</h2>
          <p className="font-body text-tertiary opacity-60">Pronto podrás asignar rutinas y gestionar tus alumnos desde aquí.</p>
       </div>
    </div>
  );
}
