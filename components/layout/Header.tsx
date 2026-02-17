'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  LogOut, User, Plus, Menu, X, Store, LayoutDashboard 
} from 'lucide-react';

export function Header() {
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Для мобильного меню
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const pathname = usePathname(); // Чтобы знать, на какой мы странице
  const supabase = createClient();

  // Проверка авторизации при загрузке
  useEffect(() => {
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    }
    getUser();

    // Слушаем изменения авторизации (вход/выход в других вкладках)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push('/login');
  };

  // Не показываем хедер на странице входа/регистрации (опционально)
  if (pathname === '/login') return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* 1. ЛОГОТИП */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <Store className="w-5 h-5" />
          </div>
          <span className="hidden sm:inline">LocalBoard</span>
        </Link>

        {/* 2. НАВИГАЦИЯ (ДЕСКТОП) */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className={`text-sm font-medium transition-colors ${pathname === '/' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
            Главная
          </Link>
          <Link href="/catalog" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Каталог
          </Link>
        </div>

        {/* 3. ПРАВАЯ ЧАСТЬ (КНОПКИ) */}
        <div className="hidden md:flex items-center gap-4">
          {/* Кнопка "Подать объявление" - Видна всегда */}
          <Link 
            href="/dashboard/add-product" 
            className="flex items-center gap-2 text-sm font-semibold text-white bg-gray-900 hover:bg-black px-4 py-2 rounded-xl transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Подать объявление</span>
          </Link>

          {loading ? (
            <div className="w-8 h-8 bg-gray-100 rounded-full animate-pulse" />
          ) : user ? (
            // ЕСЛИ АВТОРИЗОВАН
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                title="Личный кабинет"
              >
                <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border border-blue-100">
                   <User className="w-5 h-5" />
                </div>
                <span className="text-sm">Кабинет</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Выйти"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            // ЕСЛИ ГОСТЬ
            <Link 
              href="/login" 
              className="text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              Войти
            </Link>
          )}
        </div>

        {/* 4. МОБИЛЬНОЕ МЕНЮ (КНОПКА) */}
        <button 
          className="md:hidden p-2 text-gray-600"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* 5. ВЫПАДАЮЩЕЕ МОБИЛЬНОЕ МЕНЮ */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white absolute w-full shadow-lg animate-in slide-in-from-top-2">
          <div className="p-4 space-y-4">
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="block text-gray-900 font-medium">
              Главная
            </Link>
            
            <Link href="/dashboard/add-product" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 text-blue-600 font-bold">
              <Plus className="w-4 h-4" /> Подать объявление
            </Link>

            <div className="h-px bg-gray-100 my-2" />

            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 text-gray-900 font-medium">
                  <LayoutDashboard className="w-4 h-4" /> Личный кабинет
                </Link>
                <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="flex items-center gap-2 text-red-600 font-medium w-full text-left">
                  <LogOut className="w-4 h-4" /> Выйти
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setIsMenuOpen(false)} className="block w-full text-center py-2 bg-gray-900 text-white rounded-xl font-bold">
                Войти в аккаунт
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}