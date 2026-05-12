import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Gym de la Costa',
  description: 'Gestion moderna y escalable para el entrenamiento',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="es">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
