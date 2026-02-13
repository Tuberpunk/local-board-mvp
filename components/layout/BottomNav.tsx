'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Heart, PlusCircle, User, Store } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface BottomNavProps {
  favoritesCount?: number;
  isAuthenticated?: boolean;
}

const navItems = [
  { href: '/', label: 'Главная', icon: Home },
  { href: '/favorites', label: 'Избранное', icon: Heart, showBadge: true },
  { href: '/dashboard/add-product', label: 'Разместить', icon: PlusCircle, highlight: true },
  { href: '/dashboard', label: 'Кабинет', icon: User, requiresAuth: true },
];

export function BottomNav({ 
  favoritesCount = 0, 
  isAuthenticated = false 
}: BottomNavProps) {
  const pathname = usePathname();

  // Фильтруем пункты, требующие авторизации
  const visibleItems = navItems.filter(
    (item) => !item.requiresAuth || isAuthenticated
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t safe-area-pb md:hidden">
      <div className="flex items-center justify-around h-16">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const badgeCount = item.showBadge ? favoritesCount : 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full',
                'transition-colors relative',
                item.highlight 
                  ? 'text-blue-600'
                  : isActive 
                    ? 'text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <div className="relative">
                <Icon 
                  className={cn(
                    'w-6 h-6',
                    item.highlight && 'fill-current'
                  )} 
                />
                {badgeCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                    {badgeCount > 9 ? '9+' : badgeCount}
                  </span>
                )}
              </div>
              <span className={cn(
                'text-[10px] mt-0.5',
                item.highlight && 'font-medium'
              )}>
                {item.label}
              </span>
              
              {/* Active indicator */}
              {isActive && !item.highlight && (
                <div className="absolute -bottom-0.5 w-1 h-1 bg-blue-600 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
