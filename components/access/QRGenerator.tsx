'use client';
import { QRCodeSVG } from 'qrcode.react';

export default function QRGenerator({ userId }: { userId: string }) {
  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-surface-container-low rounded-xl ghost-border overflow-hidden group">
      <div className="relative p-4 bg-white rounded-lg shadow-2xl transition-transform hover:scale-105 duration-300">
        <QRCodeSVG 
          value={userId} 
          size={200}
          level="H"
          includeMargin={false}
          imageSettings={{
            src: "/favicon.ico",
            x: undefined,
            y: undefined,
            height: 24,
            width: 24,
            excavate: true,
          }}
        />
        <div className="absolute inset-0 border-2 border-primary/20 rounded-lg pointer-events-none group-hover:border-primary transition-colors"></div>
      </div>
      <div className="text-center">
        <h3 className="font-headline text-lg font-black uppercase tracking-tight text-on-surface">Tu Acceso Digital</h3>
        <p className="font-label text-[10px] uppercase tracking-[0.2em] text-tertiary mt-2">Escanea en la recepción para ingresar</p>
      </div>
      <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
        <div className="h-full bg-primary animate-pulse w-1/3"></div>
      </div>
    </div>
  );
}
