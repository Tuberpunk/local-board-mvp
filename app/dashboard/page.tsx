'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Plus, Package, Store, TrendingUp, 
  Pencil, Trash2, Eye, Settings, LogOut, 
  MapPin, Wrench, ExternalLink
} from 'lucide-react';

// Типы данных
type Product = {
  id: string;
  title: string;
  price: number | null;
  images: string[];
  is_active: boolean;
  type: 'good' | 'service'; // Добавили тип
  views_count?: number; 
};

type Shop = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  city: string | null;
  avatar_url?: string;
};

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();
  
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        // 1. Получаем магазин пользователя
        const { data: shopData } = await supabase
          .from('shops')
          .select('id, name, slug, avatar_url, city, description')
          .eq('profile_id', session.user.id)
          .single();

        if (!shopData) {
          router.push('/dashboard/create-shop');
          return;
        }
        setShop(shopData);

        // 2. Получаем товары этого магазина
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('shop_id', shopData.id)
          .order('created_at', { ascending: false });

        setProducts(productsData || []);
      } catch (error) {
        console.error('Ошибка загрузки:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router, supabase]);

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Вы уверены, что хотите удалить это объявление?')) return;

    const { error } = await supabase.from('products').delete().eq('id', productId);
    
    if (!error) {
      setProducts(products.filter(p => p.id !== productId));
    } else {
      alert('Ошибка при удалении');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* --- ШАПКА --- */}
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* --- 1. КАРТОЧКА МАГАЗИНА (Управление Магазином) --- */}
        <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Аватар */}
          <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-2xl flex-shrink-0 overflow-hidden border border-gray-200">
             {shop?.avatar_url ? (
               <img src={shop.avatar_url} alt={shop.name} className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-gray-400">
                 <Store className="w-8 h-8" />
               </div>
             )}
          </div>
          
          {/* Инфо */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{shop?.name}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
               <div className="flex items-center gap-1">
                 <MapPin className="w-4 h-4" />
                 {shop?.city || 'Город не указан'}
               </div>
               <div className="flex items-center gap-1">
                 <Package className="w-4 h-4" />
                 {products.length} объявлений
               </div>
            </div>
            <p className="text-gray-600 text-sm line-clamp-2 max-w-2xl">
              {shop?.description || 'Описание отсутствует'}
            </p>
          </div>
<Link 
     href="/dashboard/profile"
     className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors px-2"
     title="Настройки профиля"
  >
     <Settings className="w-4 h-4" />
     <span className="hidden sm:inline">Профиль</span>
  </Link>
          {/* Кнопка Редактировать Магазин */}
          <Link 
            href="/dashboard/settings"
            className="w-full md:w-auto px-5 py-3 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Settings className="w-4 h-4" />
            Настроить магазин
          </Link>
        </section>

        {/* --- 2. УПРАВЛЕНИЕ ТОВАРАМИ И УСЛУГАМИ --- */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900">Мои объявления</h2>
            <Link 
              href="/dashboard/add-product" 
              className="inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white px-5 py-3 rounded-xl font-medium shadow-lg shadow-gray-900/10 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="w-5 h-5" />
              Добавить
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Пока пусто</h3>
              <p className="text-gray-500 max-w-sm mx-auto mt-2 mb-6">
                Начните с добавления первого товара или услуги.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">

                  {/* Картинка */}
                  <Link href={`/product/${product.id}`} className="aspect-square bg-gray-100 relative overflow-hidden block">
                    {product.images && product.images[0] ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        {product.type === 'service' ? <Wrench className="w-10 h-10"/> : <Package className="w-10 h-10" />}
                      </div>
                    )}
                    
                    {/* БЕЙДЖ: Товар или Услуга */}
                    <div className="absolute top-3 left-3 flex gap-2">
                       <span className={`px-2 py-1 rounded-md text-xs font-bold backdrop-blur-md ${
                         product.type === 'service' 
                           ? 'bg-orange-500/90 text-white' 
                           : 'bg-blue-600/90 text-white'
                       }`}>
                         {product.type === 'service' ? 'Услуга' : 'Товар'}
                       </span>
                    </div>

                    {/* Статус */}
                    <div className="absolute top-3 right-3">
                      {!product.is_active && (
                        <span className="px-2 py-1 rounded-md text-xs font-bold bg-black/60 backdrop-blur-md text-white">
                          Скрыт
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* Инфо */}
                  <div className="p-4 flex flex-col flex-grow">
                    <div className="mb-2">
                      <Link href={`/product/${product.id}`} className="font-bold text-gray-900 line-clamp-1 hover:text-blue-600 transition-colors">
                        {product.title}
                      </Link>
                    </div>
                    <div className="text-lg font-bold text-gray-900 mb-4">
                      {product.price ? `${product.price.toLocaleString('ru-RU')} ₽` : 'Цена не указана'}
                    </div>
                    
                    {/* КНОПКИ РЕДАКТИРОВАНИЯ */}
                    <div className="flex gap-2 mt-auto pt-2 border-t border-gray-50">
                      <Link 
                        href={`/dashboard/edit-product/${product.id}`}
                        className="flex-1 h-10 flex items-center justify-center gap-1.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Pencil className="w-4 h-4" /> Изменить
                      </Link>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="h-10 w-10 flex items-center justify-center bg-gray-50 hover:bg-red-50 hover:text-red-600 text-gray-400 rounded-lg transition-colors"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}