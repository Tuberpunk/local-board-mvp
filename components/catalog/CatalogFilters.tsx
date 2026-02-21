'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

type Category = {
  id: string;
  name: string;
};

type Props = {
  categories: Category[];
  maxAvailablePrice: number;
};

export function CatalogFilters({ categories, maxAvailablePrice }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Локальный стейт для поиска и ползунков цен (для дебаунса)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  
  const safeMaxLimit = maxAvailablePrice > 0 ? maxAvailablePrice : 10000;
  const [minPrice, setMinPrice] = useState(Number(searchParams.get('min_price')) || 0);
  const [maxPrice, setMaxPrice] = useState(searchParams.has('max_price') ? Number(searchParams.get('max_price')) : safeMaxLimit);

  // Синхронизация при сбросе фильтров извне
  useEffect(() => {
    if (!searchParams.get('min_price')) setMinPrice(0);
    if (!searchParams.get('max_price')) setMaxPrice(safeMaxLimit);
    if (!searchParams.get('q')) setSearchQuery('');
  }, [searchParams, safeMaxLimit]);

  // Универсальная функция для мгновенных фильтров (селекты)
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all' && value !== 'newest') params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  };

  // Дебаунс для Текстового поиска и Цен
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      let changed = false;

      // Проверка строки поиска
      if (searchQuery !== (searchParams.get('q') || '')) {
        if (searchQuery) params.set('q', searchQuery);
        else params.delete('q');
        changed = true;
      }

      // Проверка минимальной цены
      if (minPrice !== Number(searchParams.get('min_price') || 0)) {
        if (minPrice > 0) params.set('min_price', minPrice.toString());
        else params.delete('min_price');
        changed = true;
      }

      // Проверка максимальной цены
      const currentUrlMax = searchParams.has('max_price') ? Number(searchParams.get('max_price')) : safeMaxLimit;
      if (maxPrice !== currentUrlMax) {
        if (maxPrice < safeMaxLimit) params.set('max_price', maxPrice.toString());
        else params.delete('max_price');
        changed = true;
      }

      if (changed) {
        router.push(`${pathname}?${params.toString()}`);
      }
    }, 500); // 500мс задержка после окончания ввода/перетаскивания

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, minPrice, maxPrice, searchParams, pathname, router, safeMaxLimit]);

  const resetFilters = () => {
    router.push(pathname);
  };

  const currentType = searchParams.get('type') || 'all';
  const currentCategory = searchParams.get('category') || '';
  const currentSort = searchParams.get('sort') || 'newest';

  const hasFilters = searchParams.toString() !== '';

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 space-y-6">
      
      {/* ВЕРХНИЙ РЯД: ПОИСК И СЕЛЕКТЫ */}
      <div className="flex flex-col lg:flex-row gap-4 items-end lg:items-center">
        <div className="w-full lg:flex-1 relative">
          <label className="text-xs font-bold text-gray-500 ml-1 mb-1 block">Поиск</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Найти товар или услугу..."
              className="w-full h-11 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="flex-1 sm:w-auto min-w-[140px]">
            <label className="text-xs font-bold text-gray-500 ml-1 mb-1 block">Тип</label>
            <select value={currentType} onChange={(e) => updateFilter('type', e.target.value)} className="w-full h-11 px-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer">
              <option value="all">Все</option>
              <option value="good">Товары</option>
              <option value="service">Услуги</option>
            </select>
          </div>

          <div className="flex-1 sm:w-auto min-w-[180px]">
             <label className="text-xs font-bold text-gray-500 ml-1 mb-1 block">Категория</label>
             <select value={currentCategory} onChange={(e) => updateFilter('category', e.target.value)} className="w-full h-11 px-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer">
               <option value="">Все категории</option>
               {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
             </select>
          </div>

          <div className="flex-1 sm:w-auto min-w-[160px]">
             <label className="text-xs font-bold text-gray-500 ml-1 mb-1 block">Сортировка</label>
             <select value={currentSort} onChange={(e) => updateFilter('sort', e.target.value)} className="w-full h-11 px-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer">
               <option value="newest">Сначала новые</option>
               <option value="cheap">Сначала дешевые</option>
               <option value="expensive">Сначала дорогие</option>
             </select>
          </div>
        </div>
      </div>

      {/* НИЖНИЙ РЯД: ФИЛЬТР ЦЕНЫ И СБРОС */}
      <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-6 justify-between items-end">
        
        {/* Компонент цены */}
        <div className="w-full sm:max-w-md space-y-3">
          <label className="text-xs font-bold text-gray-500 ml-1 block">Цена (₽)</label>
          
          {/* Инпуты ввода */}
          <div className="flex gap-2 items-center">
             <input 
               type="number" 
               value={minPrice} 
               onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice))} 
               className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm" 
               placeholder="От 0"
             />
             <span className="text-gray-400 font-medium">-</span>
             <input 
               type="number" 
               value={maxPrice} 
               onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice))} 
               className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm" 
               placeholder={`До ${safeMaxLimit}`}
             />
          </div>

          {/* Двойной ползунок */}
          <div className="relative h-6 w-full flex items-center">
            {/* Серый фон */}
            <div className="absolute w-full h-1.5 bg-gray-200 rounded-full" />
            
            {/* Синяя активная линия */}
            <div 
              className="absolute h-1.5 bg-blue-600 rounded-full" 
              style={{ 
                left: `${(minPrice / safeMaxLimit) * 100}%`, 
                right: `${100 - (maxPrice / safeMaxLimit) * 100}%` 
              }}
            />
            
            {/* Невидимый ползунок Min */}
            <input 
              type="range" min={0} max={safeMaxLimit} value={minPrice} 
              onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice - 1))}
              className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md cursor-pointer"
            />
            
            {/* Невидимый ползунок Max */}
            <input 
              type="range" min={0} max={safeMaxLimit} value={maxPrice} 
              onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice + 1))}
              className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md cursor-pointer"
            />
          </div>
        </div>

        {/* КНОПКА СБРОСА */}
        {hasFilters && (
          <button 
            onClick={resetFilters}
            className="h-10 px-5 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors gap-2 font-medium w-full sm:w-auto flex-shrink-0"
          >
            <X className="w-5 h-5" /> Сбросить всё
          </button>
        )}
      </div>
    </div>
  );
}