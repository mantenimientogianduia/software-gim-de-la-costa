'use client';
import { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { attendanceService } from '@/services/attendance.service';
import { userService } from '@/services/user.service';
import { calculateMemberFinanceSummaries, financeService } from '@/services/finance.service';
import { defaultAudioService } from '@/services/AudioService';

export default function QRScanner() {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'warning' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAccess = async (identifier: string) => {
    if (!identifier || status === 'processing') return;
    
    setStatus('processing');
    setMessage('Verificando DNI: ' + identifier);
    
    try {
      const user = await userService.getUserByDni(identifier);
      if (!user) {
         setStatus('error');
         setMessage('Socio no encontrado (DNI: ' + identifier + ')');
         setTimeout(() => setStatus('idle'), 3000);
         return;
      }

      if (user.atGym) {
        await attendanceService.checkOut(user.email, user.id);
        setStatus('success');
        setMessage(`Salida: ${user.firstName} ${user.lastName}`);
      } else {
        const payments = await financeService.getUserPayments(user.email);
        const [finance] = calculateMemberFinanceSummaries({ users: [user], payments });
        await attendanceService.checkIn(user.email, user.id);
        if (finance?.financeStatus === 'moroso') {
          defaultAudioService.vibrate([300, 100, 300]);
          defaultAudioService.playBeep(180, 0.25, 'sawtooth', 0.35);
          setStatus('warning');
          setMessage(`MOROSO / CUOTA VENCIDA / SIN PAGOS - Ingreso permitido: ${user.firstName} ${user.lastName}`);
        } else {
          setStatus('success');
          setMessage(`Ingreso: ${user.firstName} ${user.lastName}`);
        }
      }

      setTimeout(() => {
        setStatus('idle');
        setMessage('');
        if (inputRef.current) {
          inputRef.current.value = '';
          inputRef.current.focus();
        }
      }, 2500);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage('Error al procesar acceso');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const handleManualInput = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const val = inputRef.current?.value;
    if (val) {
      handleAccess(val.trim());
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-surface-container-low p-8 rounded-2xl ghost-border overflow-hidden ring-1 ring-outline-variant/10 shadow-2xl">
         <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-headline text-2xl font-black uppercase tracking-tighter italic">Control de Accesos</h2>
              <p className="text-tertiary text-[10px] uppercase tracking-widest mt-1">Lector QR o Ingreso Manual</p>
            </div>
            <div className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-500 ${
               status === 'success' ? 'bg-green-500 text-white shadow-glow-green' :
               status === 'warning' ? 'bg-yellow-500 text-black' :
               status === 'error' ? 'bg-red-500 text-white' :
               status === 'processing' ? 'bg-primary text-on-primary animate-pulse' : 'bg-surface-container-highest text-tertiary'
            }`}>
               {status === 'idle' ? 'Listo' : status}
            </div>
         </div>

         <div className="bg-black/20 p-12 rounded-xl border-2 border-dashed border-outline-variant/20 flex flex-col items-center justify-center text-center">
            <span className={`material-symbols-outlined text-6xl mb-4 transition-all duration-500 ${status === 'success' ? 'text-green-500 scale-110' : status === 'warning' ? 'text-yellow-500 scale-110 animate-pulse' : status === 'error' ? 'text-red-500' : 'text-primary'}`}>
              {status === 'success' ? 'check_circle' : status === 'warning' ? 'warning' : status === 'error' ? 'cancel' : 'qr_code_scanner'}
            </span>
            <p className="font-label text-xs uppercase tracking-widest text-tertiary max-w-[200px]">
              Posiciona el código frente al lector o ingresa el DNI debajo
            </p>
         </div>

         <form onSubmit={handleManualInput} className="mt-8">
            <div className="relative group">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary group-focus-within:scale-110 transition-transform">badge</span>
              <input 
                ref={inputRef}
                type="text" 
                placeholder="INGRESAR DNI..." 
                className="w-full bg-surface-container-high pl-16 pr-6 py-6 rounded-xl outline-none font-headline font-black text-2xl tracking-tighter border-2 border-outline-variant/10 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:opacity-20 uppercase"
                autoFocus
                autoComplete="off"
              />
            </div>
            <button 
              type="submit"
              className="w-full mt-4 bg-surface-container-highest py-4 rounded-xl font-label text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all"
            >
              Confirmar Acceso
            </button>
         </form>

         {message && (
            <div className={`mt-8 p-6 rounded-2xl text-center shadow-xl animate-in fade-in slide-in-from-top-4 duration-500 ${
               status === 'success' ? 'bg-green-500 text-white' :
               status === 'warning' ? 'bg-yellow-500 text-black' :
               status === 'error' ? 'bg-red-500 text-white' : 'bg-surface-container-highest text-white'
            }`}>
               <p className="font-headline font-black uppercase italic text-lg">{message}</p>
            </div>
         )}
         
         <div className="mt-8 flex gap-4 items-center justify-center">
            <div className="h-px bg-outline-variant/10 flex-1"></div>
            <p className="font-label text-[8px] uppercase tracking-[0.3em] text-tertiary">Terminal de Acceso Seguro</p>
            <div className="h-px bg-outline-variant/10 flex-1"></div>
         </div>
      </div>
    </div>
  );
}
