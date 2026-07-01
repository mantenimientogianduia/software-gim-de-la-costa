'use client';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AlumnoRecord {
  id: string;
  nro: number;
  firstName: string;
  lastName: string;
  dni: string;
  phone: string;
  email: string;
  birthDate: string | null;
}

const BATCH_SIZE = 50;

export default function ImportAlumnosPage() {
  const { profile } = useAuth();
  const [status, setStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [skipped, setSkipped] = useState(0);

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center text-tertiary font-label uppercase tracking-widest">
        Acceso denegado
      </div>
    );
  }

  const runImport = async () => {
    setStatus('running');
    setProgress(0);
    setErrors([]);
    setSkipped(0);

    let data: AlumnoRecord[];
    try {
      const res = await fetch('/data/alumnos-import.json');
      data = await res.json();
    } catch (e) {
      setErrors(['No se pudo cargar alumnos-import.json']);
      setStatus('error');
      return;
    }

    setTotal(data.length);
    let done = 0;
    let skipCount = 0;
    const errs: string[] = [];

    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const batch = data.slice(i, i + BATCH_SIZE);
      await Promise.allSettled(
        batch.map(async (alumno) => {
          try {
            const ref = doc(db, 'users', alumno.id);
            await setDoc(ref, {
              email: alumno.email,
              firstName: alumno.firstName,
              lastName: alumno.lastName,
              dni: alumno.dni || '',
              phone: alumno.phone || '',
              birthDate: alumno.birthDate || null,
              role: 'socio',
              status: 'active',
              atGym: false,
              currentActivity: '',
              weight: 0,
              height: 0,
              gender: 'otro',
              otherSports: '',
              fitnessLevel: 'principiante',
              healthObservations: '',
              goals: '',
              weeklyTrainingGoal: 3,
              currentPlan: 'Básico',
              socialVisibility: 'hidden',
              instagram: '',
              publicBio: '',
              currentStreak: 0,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            }, { merge: false });
            done++;
          } catch (e: any) {
            errs.push(`#${alumno.nro} ${alumno.firstName} ${alumno.lastName}: ${e.message}`);
            skipCount++;
          }
        })
      );
      setProgress(Math.min(i + BATCH_SIZE, data.length));
      setSkipped(skipCount);
      setErrors([...errs]);
      // Small pause to avoid rate limiting
      await new Promise(r => setTimeout(r, 100));
    }

    setStatus('done');
  };

  const pct = total > 0 ? Math.round((progress / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-surface text-on-surface p-8 md:p-16 font-body">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="font-headline font-black text-4xl uppercase tracking-tight italic mb-2">
            Importar Alumnos
          </h1>
          <p className="text-tertiary text-sm">
            Carga los 476 socios desde el Excel de alumnos a Firestore. Solo ejecutar una vez.
          </p>
        </div>

        {status === 'idle' && (
          <div className="bg-surface-container-low rounded-lg p-6 ghost-border space-y-4">
            <p className="font-label text-[10px] uppercase tracking-widest text-tertiary">Qué hace este proceso:</p>
            <ul className="text-sm space-y-2 text-on-surface/80 list-disc list-inside">
              <li>Crea 476 documentos en la colección <code className="text-primary">users</code></li>
              <li>Cada socio queda con <code className="text-primary">role: socio</code> y <code className="text-primary">status: active</code></li>
              <li>Los que no tienen email real quedan con email placeholder (<code className="text-primary">importado.N@gymdelacosta.local</code>)</li>
              <li>Si el socio ya se registró con Google, el admin puede fusionar los registros manualmente</li>
            </ul>
            <button
              onClick={runImport}
              className="w-full bg-gradient-primary text-on-primary py-4 rounded-sm font-label text-[10px] font-black uppercase tracking-[0.2em] shadow-glow"
            >
              Iniciar Importación (476 socios)
            </button>
          </div>
        )}

        {status === 'running' && (
          <div className="bg-surface-container-low rounded-lg p-6 ghost-border space-y-4">
            <div className="flex justify-between items-center">
              <p className="font-label text-[10px] uppercase tracking-widest text-primary animate-pulse">
                Importando...
              </p>
              <p className="font-mono text-sm">{progress} / {total}</p>
            </div>
            <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="font-mono text-xs text-tertiary">{pct}% completado</p>
            {errors.length > 0 && (
              <p className="text-yellow-400 text-xs">{errors.length} errores hasta ahora</p>
            )}
          </div>
        )}

        {status === 'done' && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 space-y-3">
            <p className="font-label text-[10px] uppercase tracking-widest text-green-400">
              Importación completada
            </p>
            <p className="font-mono text-sm">
              {total - skipped} socios importados correctamente
              {skipped > 0 && ` · ${skipped} con error`}
            </p>
            {errors.length > 0 && (
              <details className="mt-4">
                <summary className="text-xs text-yellow-400 cursor-pointer">Ver errores ({errors.length})</summary>
                <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                  {errors.map((e, i) => <p key={i} className="text-xs text-error font-mono">{e}</p>)}
                </div>
              </details>
            )}
          </div>
        )}

        {status === 'error' && (
          <div className="bg-error/10 border border-error/30 rounded-lg p-4 text-error text-sm">
            {errors[0]}
          </div>
        )}
      </div>
    </div>
  );
}
