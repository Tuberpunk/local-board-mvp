import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// ИМПОРТИРУЕМ НАШ НОВЫЙ ХЕДЕР
import { Header } from '@/components/layout/Header';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'Local Board MVP',
  description: 'Локальная доска объявлений',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        {/* ВСТАВЛЯЕМ ХЕДЕР СЮДА */}
        <Header />
        
        {children}
      </body>
    </html>
  );
}