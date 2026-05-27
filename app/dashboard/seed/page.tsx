'use client';
import { useEffect, useState } from 'react';
import { routineService, Exercise } from '@/services/routine.service';
import { userService } from '@/services/user.service';
import { useAuth } from '@/hooks/use-auth';

const DEV_TOOLS_ENABLED = process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === 'true';
const DEV_EMAIL = 'gino.pieretti00@gmail.com';

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

export default function SeedPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => setLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

  const runSeed = async () => {
    if (!user) return;
    setStatus('loading');
    setLog([]);
    try {
      addLog('Iniciando carga de ejercicios maestros...');
      for (const ex of COMMON_EXERCISES) {
        await routineService.addMasterExercise(ex);
        addLog(`Añadido: ${ex.name}`);
      }

      addLog('Creando Rutina Completa 1: Empuje/Tirón/Pierna (Template)...');
      const plan1Id = await routineService.createPlan({
        title: 'Fundamentos de Fuerza - PPL',
        description: 'Plan de 3 días para iniciación en hipertrofia y fuerza básica.',
        type: 'template',
        instructorId: user.email!,
        status: 'active',
        weeksCount: 4,
        level: 'beginner',
        tags: ['Fuerza', 'Básico']
      });

      // Simple 1 week pattern for template
      await routineService.saveWeek({
        planId: plan1Id,
        order: 1,
        type: 'base',
        goal: 'Adaptación anatómica',
        days: [
          {
            order: 1,
            name: 'Día 1: Empuje',
            blocks: [
              {
                type: 'main',
                exercises: [
                  COMMON_EXERCISES[1], // Press banca
                  COMMON_EXERCISES[3], // Press militar
                  COMMON_EXERCISES[8], // Triceps
                ]
              }
            ]
          },
          {
            order: 2,
            name: 'Día 2: Tirón',
            blocks: [
              {
                type: 'main',
                exercises: [
                  COMMON_EXERCISES[4], // Dominadas
                  COMMON_EXERCISES[5], // Remo
                  COMMON_EXERCISES[7], // Biceps
                ]
              }
            ]
          },
          {
            order: 3,
            name: 'Día 3: Pierna',
            blocks: [
              {
                type: 'main',
                exercises: [
                  COMMON_EXERCISES[0], // Sentadilla
                  COMMON_EXERCISES[2], // PMR
                  COMMON_EXERCISES[6], // Zancadas
                ]
              }
            ]
          }
        ]
      });
      addLog('Rutina 1 creada.');

      addLog('Creando Rutina Completa 2: Torso/Pierna Avanzado (Template)...');
      const plan2Id = await routineService.createPlan({
        title: 'Especialización Estética - Torso/Pierna',
        description: 'Alta frecuencia y volumen para niveles intermedios-avanzados.',
        type: 'template',
        instructorId: user.email!,
        status: 'active',
        weeksCount: 8,
        level: 'advanced',
        tags: ['Hipertrofia', 'Avanzado']
      });

      await routineService.saveWeek({
        planId: plan2Id,
        order: 1,
        type: 'base',
        goal: 'Volumen acumulativo',
        days: [
          {
            order: 1,
            name: 'Día 1: Torso (Fuerza)',
            blocks: [
              {
                type: 'main',
                exercises: [
                  { ...COMMON_EXERCISES[1], prescribed: { sets: 5, reps: '5', load: '85%' } },
                  { ...COMMON_EXERCISES[5], prescribed: { sets: 4, reps: '8', load: 'RPE 8' } },
                ]
              }
            ]
          },
          {
            order: 2,
            name: 'Día 2: Pierna (Fuerza)',
            blocks: [
              {
                type: 'main',
                exercises: [
                  { ...COMMON_EXERCISES[0], prescribed: { sets: 5, reps: '5', load: '85%' } },
                  { ...COMMON_EXERCISES[2], prescribed: { sets: 4, reps: '8', load: 'RPE 8' } },
                ]
              }
            ]
          }
        ]
      });
      addLog('Rutina 2 creada.');

      addLog('Creando Rutina Completa 3: Cardio & Core (Template)...');
      const plan3Id = await routineService.createPlan({
        title: 'Acondicionamiento Metabólico',
        description: 'Sesiones de alta intensidad para quema calórica y salud cardiovascular.',
        type: 'template',
        instructorId: user.email!,
        status: 'active',
        weeksCount: 4,
        level: 'intermediate',
        tags: ['Cardio', 'Core']
      });

      await routineService.saveWeek({
        planId: plan3Id,
        order: 1,
        type: 'base',
        goal: 'Capacidad aeróbica',
        days: [
          {
            order: 1,
            name: 'Día 1: HIIT',
            blocks: [
              {
                type: 'main',
                exercises: [
                  { ...COMMON_EXERCISES[9], prescribed: { sets: 4, reps: '1 min', load: 'N/A' } },
                  { name: 'Burpees', prescribed: { sets: 4, reps: '15', load: 'N/A' } },
                ]
              }
            ]
          }
        ]
      });
      addLog('Rutina 3 creada.');

      addLog('Creando SOCIOS DE PRUEBA (Mocks)...');
      const mockSocios = [
        { id: 'mock_socio_1', email: 'juan.perez@ficticio.com', firstName: 'Juan', lastName: 'Pérez', dni: '11223344' },
        { id: 'mock_socio_2', email: 'maria.garcia@ficticio.com', firstName: 'María', lastName: 'García', dni: '22334455' },
        { id: 'mock_socio_3', email: 'carlos.rodriguez@ficticio.com', firstName: 'Carlos', lastName: 'Rodríguez', dni: '33445566' },
        { id: 'mock_socio_4', email: 'ana.martinez@ficticio.com', firstName: 'Ana', lastName: 'Martínez', dni: '44556677' },
      ];

      for (const socio of mockSocios) {
        await userService.createUserProfile(socio.id, socio.email, socio.firstName, socio.lastName, 'socio', socio.dni);
        // Force status to active for testing
        await userService.updateUserStatus(socio.id, 'active');
        addLog(`Socio creado: ${socio.firstName} ${socio.lastName} (${socio.email})`);
      }

      setStatus('success');
      addLog('PROCESO FINALIZADO CON ÉXITO');
    } catch (err) {
      console.error(err);
      setStatus('error');
      addLog(`ERROR: ${err instanceof Error ? err.message : 'Desconocido'}`);
    }
  };

  if (!DEV_TOOLS_ENABLED || user?.email !== DEV_EMAIL) return <div>Acceso denegado</div>;

  return (
    <div className="p-20 bg-surface min-h-screen text-white font-mono">
      <h1 className="text-4xl font-black mb-8 italic">SEED DATA SYSTEM</h1>
      <button 
        onClick={runSeed}
        disabled={status === 'loading'}
        className="px-8 py-4 bg-primary rounded-xl font-bold uppercase tracking-widest disabled:opacity-50"
      >
        {status === 'loading' ? 'Ejecutando...' : 'Iniciar Carga de Datos'}
      </button>

      <div className="mt-12 space-y-2 bg-black/40 p-8 rounded-2xl border border-white/10 max-h-[400px] overflow-y-auto">
        {log.map((line, i) => (
          <p key={i} className={line.includes('ERROR') ? 'text-error' : 'text-primary'}>{line}</p>
        ))}
      </div>
      
      {status === 'success' && (
        <div className="mt-8 p-4 bg-green-500/20 text-green-400 rounded-xl border border-green-500/30">
          Datos cargados correctamente. Ya puedes volver al dashboard.
        </div>
      )}
    </div>
  );
}
