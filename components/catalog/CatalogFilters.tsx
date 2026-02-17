'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

type Category = {
  id: string;
  name: string;
};

export function CatalogFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Состояния для полей (берем начальные значения из URL)
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('category') || '');
  const [type, setType] = useState(searchParams.get('type') || 'all');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  // Функция обновления URL
  const updateFilters = () => {
    const params = new URLSearchParams();
    
    if (search) params.set('q', search);
    if (categoryId) params.set('category', categoryId);
    if (type && type !== 'all') params.set('type', type);
    if (sort && sort !== 'newest') params.set('sort', sort);

    router.push(`/catalog?${params.toString()}`);
  };

  // Дебаунс поиска (чтобы не обновлять URL при каждой букве)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Обновляем только если пользователь перестал печатать на 500мс
      // Но тут есть нюанс: это может конфликтовать с кнопкой "Применить".
      // Для простоты сделаем обновление по нажатию Enter или кнопки.
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Сброс фильтров
  const resetFilters = () => {
    setSearch('');
    setCategoryId('');
    setType('all');
    setSort('newest');
    router.push('/catalog');
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8">
      <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
        
        {/* 1. ПОИСК */}
        <div className="w-full md:flex-1 relative">
          <label className="text-xs font-bold text-gray-500 ml-1 mb-1 block">Поиск</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && updateFilters()}
              placeholder="Найти товар или услугу..."
              className="w-full h-11 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* 2. ТИП (Товар/Услуга) */}
        <div className="w-full md:w-auto min-w-[140px]">
          <label className="text-xs font-bold text-gray-500 ml-1 mb-1 block">Тип объявлений</label>
          <select 
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full h-11 px-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
          >
            <option value="all">Все</option>
            <option value="good">Товары</option>
            <option value="service">Услуги</option>
          </select>
        </div>

        {/* 3. КАТЕГОРИЯ */}
        <div className="w-full md:w-auto min-w-[180px]">
           <label className="text-xs font-bold text-gray-500 ml-1 mb-1 block">Категория</label>
           <select 
             value={categoryId}
             onChange={(e) => setCategoryId(e.target.value)}
             className="w-full h-11 px-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
           >
             <option value="">Все категории</option>
             {categories.map((c) => (
               <option key={c.id} value={c.id}>{c.name}</option>
             ))}
           </select>
        </div>

        {/* 4. СОРТИРОВКА */}
        <div className="w-full md:w-auto min-w-[160px]">
           <label className="text-xs font-bold text-gray-500 ml-1 mb-1 block">Сортировка</label>
           <select 
             value={sort}
             onChange={(e) => setSort(e.target.value)}
             className="w-full h-11 px-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
           >
             <option value="newest">Сначала новые</option>
             <option value="cheap">Сначала дешевые</option>
             <option value="expensive">Сначала дорогие</option>
           </select>
        </div>

        {/* КНОПКИ */}
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={updateFilters}
            className="flex-1 md:flex-none h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" /> Найти
          </button>
          
          {(search || categoryId || type !== 'all' || sort !== 'newest') && (
            <button 
              onClick={resetFilters}
              className="h-11 w-11 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors"
              title="Сбросить фильтры"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}