'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Plus, Package, Store, TrendingUp, 
  Pencil, Trash2, Eye, Settings, LogOut, 
  MapPin, Wrench, ExternalLink, User
} from 'lucide-react';
import Image from 'next/image';

type Product = {
  id: string;
  title: string;
  price: number | null;
  images: string[];
  is_active: boolean;
  type: 'good' | 'service';
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
  
  const [shops, setShops] = useState<Shop[]>([]);
  const [activeShopId, setActiveShopId] = useState<string | null>(null);
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

        // Получаем ВСЕ магазины пользователя
        const { data: shopsData } = await supabase
          .from('shops')
          .select('id, name, slug, avatar_url, city, description')
          .eq('profile_id', session.user.id);

        if (!shopsData || shopsData.length === 0) {
          router.push('/dashboard/create-shop');
          return;
        }

        setShops(shopsData);

        // Определяем активный магазин (из localStorage или первый по списку)
        const savedShopId = localStorage.getItem('activeShopId');
        const currentShop = shopsData.find(s => s.id === savedShopId) || shopsData[0];
        
        setActiveShopId(currentShop.id);
        localStorage.setItem('activeShopId', currentShop.id); // Сохраняем выбор

        // Загружаем товары активного магазина
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('shop_id', currentShop.id)
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

  const handleShopSwitch = (shopId: string) => {
    localStorage.setItem('activeShopId', shopId);
    setLoading(true);
    window.location.reload();
  };

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
    localStorage.removeItem('activeShopId'); // Очищаем кеш при выходе
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

  const activeShop = shops.find(s => s.id === activeShopId);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        
        {/* Панель переключения магазинов */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {shops.map(shop => (
              <button
                key={shop.id}
                onClick={() => handleShopSwitch(shop.id)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  activeShopId === shop.id 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {shop.name}
              </button>
            ))}
          </div>
          
          {shops.length < 2 && (
            <Link 
              href="/dashboard/create-shop"
              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" /> Добавить магазин (ещё {2 - shops.length})
            </Link>
          )}
        </div>

        {/* КАРТОЧКА АКТИВНОГО МАГАЗИНА */}
        {activeShop && (
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-2xl flex-shrink-0 overflow-hidden border border-gray-200">
     {activeShop.avatar_url ? (
       <Image 
         src={activeShop.avatar_url} 
         alt={activeShop.name} 
         fill 
         className="object-cover" 
         sizes="(max-width: 768px) 80px, 96px"
       />
     ) : (
                 <div className="w-full h-full flex items-center justify-center text-gray-400">
                   <Store className="w-8 h-8" />
                 </div>
               )}
            </div>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{activeShop.name}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                 {activeShop.city && <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {activeShop.city}</span>}
                 <Link href={`/shop/${activeShop.slug}`} target="_blank" className="flex items-center gap-1 text-blue-600 hover:underline">
                    <ExternalLink className="w-4 h-4" /> Посмотреть страницу
                 </Link>
              </div>
              <p className="text-gray-600 text-sm line-clamp-2 max-w-2xl">{activeShop.description}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto mt-4 md:mt-0">
               <Link href="/dashboard/settings" className="flex-1 md:flex-none px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl flex items-center justify-center gap-2 transition-colors">
                  <Settings className="w-4 h-4"/> Настройки магазина 
               </Link>
            </div>
          </section>
        )}

        {/* СТАТИСТИКА (можно расширить в будущем) */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-gray-500 text-sm font-medium mb-1 flex items-center gap-2">
              <Package className="w-4 h-4" /> Объявления
            </div>
            <div className="text-2xl font-bold text-gray-900">{products.length}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-gray-500 text-sm font-medium mb-1 flex items-center gap-2">
              <Eye className="w-4 h-4" /> Просмотры
            </div>
            <div className="text-2xl font-bold text-gray-900">0</div>
          </div>
        </section>

        {/* СПИСОК ТОВАРОВ */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-900">Управление объявлениями</h2>
            <Link href="/dashboard/add-product" className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all">
              <Plus className="w-5 h-5"/> Добавить объявление
            </Link>
          </div>

          <div className="p-0">
            {products.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">У вас пока нет объявлений в этом магазине</h3>
                <p className="text-gray-500 mb-6 max-w-sm">Добавьте свой первый товар или услугу, чтобы начать привлекать клиентов.</p>
                <Link href="/dashboard/add-product" className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-colors">
                  <Plus className="w-5 h-5"/> Создать объявление
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {products.map((product) => (
                  <div key={product.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:bg-gray-50 transition-colors">
                    <div className="w-full sm:w-20 h-48 sm:h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 relative">
                      {product.images && product.images[0] ? (
                        <Image 
      src={product.images[0]} 
      alt={product.title} 
      fill 
      className="object-cover" 
      sizes="(max-width: 640px) 100vw, 80px"
    />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          {product.type === 'good' ? <Package className="w-6 h-6" /> : <Wrench className="w-6 h-6" />}
                        </div>
                      )}
                      {!product.is_active && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-xs font-bold text-white px-2 py-1 bg-black/50 rounded-lg">Скрыто</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${product.type === 'good' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                          {product.type === 'good' ? 'Товар' : 'Услуга'}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 truncate">{product.title}</h3>
                      <div className="text-blue-600 font-semibold mt-1">
                        {product.price ? `${product.price.toLocaleString('ru-RU')} ₽` : 'Цена не указана'}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Link href={`/dashboard/edit-product/${product.id}`} className="flex-1 sm:flex-none p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors flex items-center justify-center">
                        <Pencil className="w-5 h-5" />
                      </Link>
                      <button onClick={() => handleDeleteProduct(product.id)} className="flex-1 sm:flex-none p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center justify-center">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}