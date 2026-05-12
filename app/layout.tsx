import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Gimnasio de la Costa",
  description: "Sistema de gestión integral",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=calendar_today,calendar_view_week,check_circle,construction,dashboard,event_busy,fitness_center,grid_view,groups,login,logout,person,person_search,play_circle,schedule" />
      </head>
      <body className="antialiased bg-black text-white selection:bg-primary selection:text-white">
        {children}
      </body>
    </html>
  );
}
