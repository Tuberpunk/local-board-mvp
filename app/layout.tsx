import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Toaster } from 'react-hot-toast'; // 1. ДОБАВЛЯЕМ ИМПОРТ

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'LocalBoard - Локальная доска объявлений',
  description: 'Покупайте и продавайте товары в вашем городе',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen bg-gray-50 pb-16 md:pb-0">
          {children}
        </main>
        <BottomNav />
        
        {/* 2. ДОБАВЛЯЕМ TOASTER */}
        <Toaster 
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
              borderRadius: '12px',
            },
            success: {
              style: { background: '#10B981' }, // Зеленый для успеха
            },
            error: {
              style: { background: '#EF4444' }, // Красный для ошибки
            },
          }}
        />
      </body>
    </html>
  );
}