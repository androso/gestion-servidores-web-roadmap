import type { Metadata } from 'next';
import { Balsamiq_Sans, Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const balsamiqSans = Balsamiq_Sans({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-balsamiq-sans',
  display: 'swap',
});

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Course Roadmaps — Visualizador Interactivo',
  description: 'Visualizador estático e interactivo de rutas de aprendizaje para cursos universitarios.',
  openGraph: {
    title: 'Course Roadmaps — Visualizador Interactivo',
    description: 'Rutas de aprendizaje con trazabilidad académica y seguimiento local.',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover' as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${balsamiqSans.variable} font-sans antialiased bg-slate-50 text-slate-900`}
      >
        {children}
      </body>
    </html>
  );
}
