'use client';
import { QRCodeSVG } from 'qrcode.react';
import { createAccessPassPayload } from '@/lib/access-pass';

export default function QRGenerator({ dni }: { dni?: string }) {
  if (!dni) {
    return (
      <div className="flex flex-col items-center gap-6 p-8 bg-surface-container-low rounded-xl ghost-border overflow-hidden border-t-4 border-t-error">
        <span className="material-symbols-outlined text-4xl text-error">badge</span>
        <div className="text-center">
          <h3 className="font-headline text-lg font-black uppercase tracking-tight text-error">DNI FALTANTE</h3>
          <p className="font-label text-[10px] uppercase tracking-[0.2em] text-tertiary mt-2">Acércate a recepción para habilitar tu acceso</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-surface-container-low rounded-xl ghost-border overflow-hidden group border-t-4 border-t-primary">
      <div className="relative p-6 bg-white rounded-2xl shadow-glow transition-transform hover:scale-105 duration-500">
        <QRCodeSVG 
          value={createAccessPassPayload(dni)}
          size={180}
          level="H"
          includeMargin={false}
        />
        <div className="absolute inset-0 border-2 border-primary/20 rounded-2xl pointer-events-none group-hover:border-primary transition-colors"></div>
      </div>
      <div className="text-center">
        <h3 className="font-headline text-lg font-black uppercase tracking-tight text-on-surface">Pase de Acceso</h3>
        <p className="font-label text-xs uppercase tracking-widest text-primary mt-2 font-bold">{dni}</p>
        <p className="font-label text-[10px] uppercase tracking-[0.2em] text-tertiary mt-1">Escanea este código al ingresar</p>
      </div>
      <div className="w-full flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-1 bg-primary/20 flex-1 rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
          </div>
        ))}
      </div>
    </div>
  );
}
