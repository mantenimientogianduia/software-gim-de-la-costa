'use client';
import { useEffect, useState } from 'react';
import { routineService, Exercise } from '@/services/routine.service';
import { userService } from '@/services/user.service';
import { useAuth, AuthProvider } from '@/hooks/use-auth';

const COMMON_EXERCISES: Exercise[] = [
  { name: 'Sentadilla con Barra', prescribed: { sets: 3, reps: '8-10', load: 'RPE 8' }, notes: 'Foco en profundidad y control' },
  { name: 'Press de Banca', prescribed: { sets: 3, reps: '6-8', load: 'RPE 9' }, notes: 'Retracción escapular obligatoria' },
  { name: 'Peso Muerto Rumano', prescribed: { sets: 3, reps: '10-12', load: 'RPE 7' }, notes: 'Sentir el estiramiento en isquios' },
  { name: 'Press Militar', prescribed: { sets: 3, reps: '8-10', load: 'RPE 8' }, notes: 'No arquear la espalda baja' },
  { name: 'Dominadas', prescribed: { sets: 3, reps: 'Fallo - 1', load: 'Peso corporal' }, notes: 'Rango completo' },
  { name: 'Remo con Barra', prescribed: { sets: 3, reps: '10-12', load: 'RPE 8' }, notes: 'Torso paralelo al suelo' },
  { name: 'Zancadas', prescribed: { sets: 3, reps: '12 por pierna', load: 'Mancuernas' }, notes: 'Paso largo' },
  { name: 'Curl de Bíceps', prescribed: { sets: 3, reps: '12-15', load: 'RPE 8' }, notes: 'Sin balanceo' },
  { name: 'Extensiones de Tríceps', prescribed: { sets: 3, reps: '12-15', load: 'RPE 8' }, notes: 'Codos pegados al cuerpo' },
  { name: 'Plancha Abdominal', prescribed: { sets: 3, reps: '45 seg', load: 'N/A' }, notes: 'Mantener core activo' },
];

function SeedContent() {
  const { profile } = useAuth();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => setLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

  const runSeed = async () => {
    if (!profile) return;
    setStatus('loading');
    setLog([]);
    try {
      addLog('Iniciando carga de ejercicios maestros...');
      for (const ex of COMMON_EXERCISES) {
        await routineService.addMasterExercise(ex);
        addLog(`Añadido: ${ex.name}`);
      }

      addLog('Creando Rutina Template: Fundamentos...');
      const plan1Id = await routineService.createPlan({
        title: 'Fundamentos de Fuerza',
        description: 'Plan de 3 días para iniciación.',
        type: 'template',
        instructorId: profile.email!,
        status: 'active',
        weeksCount: 4,
        level: 'beginner',
        tags: ['Fuerza']
      });

      await routineService.saveWeek({
        planId: plan1Id,
        order: 1,
        type: 'base',
        goal: 'Adaptación',
        days: [
          {
            order: 1,
            name: 'Día A',
            blocks: [
              {
                type: 'main',
                exercises: [COMMON_EXERCISES[0], COMMON_EXERCISES[1], COMMON_EXERCISES[5]]
              }
            ]
          }
        ]
      });
      addLog('Rutina 1 creada.');

      addLog('Creando SOCIOS DE PRUEBA...');
      const mockUsers = [
        { email: 'test.socio@gym.com', name: 'Test', last: 'Socio', dni: '99887766' },
      ];

      for (const m of mockUsers) {
        // En una app real crearíamos el auth primero, pero aquí sólo queremos perfiles para ver UI
        await userService.createUserProfile(m.email, m.email, m.name, m.last, 'socio', m.dni);
        addLog(`Perfil creado: ${m.email}`);
      }

      setStatus('success');
      addLog('TODO LISTO');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      addLog(`ERROR: ${err.message}`);
    }
  };

  return (
    <div className="p-20 bg-black min-h-screen text-white font-mono">
      <h1 className="text-4xl font-black mb-8 italic text-primary">ELITE SEED SYSTEM</h1>
      <button 
        onClick={runSeed}
        disabled={status === 'loading'}
        className="px-8 py-4 bg-primary rounded-xl font-bold uppercase tracking-widest disabled:opacity-50 shadow-glow"
      >
        {status === 'loading' ? 'EJECUTANDO...' : 'INICIA CARGA'}
      </button>

      <div className="mt-12 space-y-2 bg-white/5 p-8 rounded-2xl border border-white/10 max-h-[400px] overflow-y-auto">
        {log.map((line, i) => (
          <p key={i} className={line.includes('ERROR') ? 'text-red-500' : 'text-gray-400'}>{line}</p>
        ))}
      </div>
    </div>
  );
}

export default function SeedPage() {
  return (
    <AuthProvider>
      <SeedContent />
    </AuthProvider>
  );
}
