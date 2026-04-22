'use client';
import { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { attendanceService } from '@/services/attendance.service';
import { userService } from '@/services/user.service';

export default function QRScanner() {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );
      
      scannerRef.current.render(onScanSuccess, onScanFailure);
    }

    function onScanSuccess(decodedText: string) {
      handleAccess(decodedText);
    }

    function onScanFailure() {
      // Silently ignore failures
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, []);

  const handleAccess = async (identifier: string) => {
    if (status === 'processing') return;
    
    setStatus('processing');
    setMessage('Procesando acceso...');
    
    try {
      const user = await userService.getUserByEmail(identifier);
      if (!user) {
         setStatus('error');
         setMessage('Usuario no encontrado');
         setTimeout(() => setStatus('idle'), 3000);
         return;
      }

      if (user.atGym) {
        await attendanceService.checkOut(user.email, user.id);
        setStatus('success');
        setMessage(`Salida registrada: ${user.firstName}`);
      } else {
        await attendanceService.checkIn(user.email, user.id);
        setStatus('success');
        setMessage(`Ingreso registrado: ${user.firstName}`);
      }

      setTimeout(() => {
        setStatus('idle');
        setMessage('');
        inputRef.current?.focus();
      }, 3000);
    } catch (err) {
      setStatus('error');
      setMessage('Error de comunicación');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const handleManualInput = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const val = inputRef.current?.value;
    if (val) {
      handleAccess(val);
      inputRef.current!.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-surface-container-low p-6 rounded-xl ghost-border overflow-hidden ring-1 ring-outline-variant/10">
         <div className="flex items-center justify-between mb-4">
            <h2 className="font-headline text-lg font-black uppercase tracking-tighter">Scanner de Acceso</h2>
            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${
               status === 'success' ? 'bg-green-500/20 text-green-500' :
               status === 'error' ? 'bg-red-500/20 text-red-500' :
               status === 'processing' ? 'bg-blue-500/20 text-blue-500' : 'bg-tertiary/20 text-tertiary'
            }`}>
               {status}
            </div>
         </div>

         <div id="reader" className="w-full overflow-hidden rounded-lg bg-black/40 min-h-[300px] border border-outline-variant/20"></div>

         <form onSubmit={handleManualInput} className="mt-6">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-tertiary">barcode_scanner</span>
              <input 
                ref={inputRef}
                type="text" 
                placeholder="Escaneo manual / ID de Usuario" 
                className="w-full bg-surface-container-high pl-12 pr-4 py-4 rounded-lg outline-none font-mono text-sm border border-outline-variant/10 focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                autoFocus
              />
            </div>
         </form>

         {message && (
            <div className={`mt-4 p-5 rounded-lg text-center animate-in fade-in slide-in-from-top-2 duration-300 ${
               status === 'success' ? 'bg-green-500 text-white shadow-lg' :
               status === 'error' ? 'bg-red-500 text-white' : 'bg-surface-container-highest text-white'
            }`}>
               <p className="font-label font-black uppercase tracking-widest text-sm">{message}</p>
            </div>
         )}
         
         <div className="mt-4 p-4 bg-tertiary/5 rounded-lg">
            <p className="font-label text-[9px] uppercase tracking-widest text-tertiary text-center leading-relaxed">
              El scanner procesará ingresos y salidas automáticamente según el estado actual del socio.
            </p>
         </div>
      </div>
    </div>
  );
}
