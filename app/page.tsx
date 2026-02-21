'use client';

import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { 
  ArrowRight, Store, ShoppingBag, Wrench, 
  MapPin, Star, ChevronRight, User, LogOut, Plus 
} from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';

type Shop = {
  id: string;
  name: string;
  slug: string;
  avatar_url: string | null;
  city: string | null;
  description: string | null;
};

type Product = {
  id: string;
  title: string;
  price: number | null;
  images: string[];
  type: 'good' | 'service';
  created_at: string;
  is_active: boolean;
  price_from: boolean;
  shop: {
    name: string;
    slug: string;
  } | null;
  category: {
    name: string;
    slug: string;
  } | null;
};

export default function Home() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null); // Храним данные пользователя

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      // 0. Проверяем авторизацию
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      try {
        // 1. Загружаем 4 последних магазина
        const { data: shopsData } = await supabase
          .from('shops')
          .select('id, name, slug, avatar_url, city, description')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(4);
        
        if (shopsData) setShops(shopsData);

        // 2. Загружаем 8 последних ТОВАРОВ
        const { data: productsData } = await supabase
          .from('products')
          .select(`
            *,
            shop:shops (name, slug),
            category:categories (name, slug)
          `)
          .eq('is_active', true)
          .eq('type', 'good')
          .order('created_at', { ascending: false })
          .limit(8);

        if (productsData) setProducts(productsData as any);

        // 3. Загружаем 4 последние УСЛУГИ
        const { data: servicesData } = await supabase
          .from('products')
          .select(`
            *,
            shop:shops (name, slug),
            category:categories (name, slug)
          `)
          .eq('is_active', true)
          .eq('type', 'service')
          .order('created_at', { ascending: false })
          .limit(4);

        if (servicesData) setServices(servicesData as any);

      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.reload(); // Перезагружаем страницу, чтобы обновить шапку
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      
      {/* 1. ГЕРОЙ-СЕКЦИЯ */}
      <section className="bg-white border-b border-gray-200 pt-12 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-6 border border-blue-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Локальная торговля
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-4">
            Покупайте у <span className="text-blue-600">своих</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
            Находите товары, услуги и мастеров в вашем районе.
          </p>
          
          <div className="flex justify-center gap-3">
             <Link href="/catalog" className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-gray-900/20">
               Смотреть каталог
             </Link>
          </div>
        </div>
      </section>

      {/* 2. МАГАЗИНЫ */}
      {shops.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Store className="w-6 h-6 text-blue-600" />
              Новые магазины
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading 
              ? [...Array(4)].map((_, i) => <div key={i} className="h-40 bg-gray-200 rounded-2xl animate-pulse" />)
              : shops.map((shop) => (
                <Link href={`/shop/${shop.slug}`} key={shop.id} className="group block bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-gray-100 rounded-full overflow-hidden flex-shrink-0 border border-gray-200">
                      {shop.avatar_url ? (
                        <img src={shop.avatar_url} alt={shop.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                          <Store className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{shop.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{shop.city || 'Город не указан'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-50">
                     <div className="flex items-center gap-1 text-yellow-500 font-bold">
                        <Star className="w-4 h-4 fill-yellow-500" /> 5.0
                     </div>
                     <span className="text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                       Открыть →
                     </span>
                  </div>
                </Link>
            ))}
          </div>
        </section>
      )}

      {/* 3. ТОВАРЫ */}
      <section id="products" className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-purple-600" />
            Свежие товары
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading 
            ? [...Array(8)].map((_, i) => <div key={i} className="aspect-[3/4] bg-gray-200 rounded-2xl animate-pulse" />)
            : products.length > 0 ? (
                products.map((product) => (
                  <ProductCard key={product.id} product={product as any} />
                ))
              ) : (
                <div className="col-span-full py-10 text-center text-gray-500 bg-white rounded-2xl border border-dashed border-gray-200">
                  Пока нет товаров. Станьте первым!
                </div>
              )
          }
        </div>
      </section>

      {/* 4. УСЛУГИ */}
      {services.length > 0 && (
        <section className="bg-white py-12 border-t border-gray-100 mt-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Wrench className="w-6 h-6 text-orange-600" />
                Услуги и Мастера
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isLoading 
                ? [...Array(2)].map((_, i) => <div key={i} className="h-32 bg-gray-200 rounded-2xl animate-pulse" />)
                : services.map((service) => (
                  <Link href={`/product/${service.id}`} key={service.id} className="flex bg-gray-50 border border-gray-100 rounded-2xl p-4 hover:bg-white hover:shadow-lg hover:border-blue-100 transition-all group">
                    <div className="w-24 h-24 bg-white rounded-xl overflow-hidden flex-shrink-0 border border-gray-200">
                      {service.images && service.images[0] ? (
                        <img src={service.images[0]} alt={service.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Wrench className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex flex-col justify-between flex-1 py-1">
                      <div>
                        <div className="text-xs text-orange-600 font-bold mb-1 uppercase tracking-wider">Услуга</div>
                        <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                          {service.title}
                        </h3>
                      </div>
                      <div className="flex items-end justify-between mt-2">
                         <div className="font-bold text-gray-900">
                           {service.price ? `${service.price.toLocaleString()} ₽` : 'Цена договорная'}
                           {service.price_from && <span className="text-xs font-normal text-gray-500 ml-1">от</span>}
                         </div>
                         <div className="text-xs text-gray-500">
                           {service.shop?.name}
                         </div>
                      </div>
                    </div>
                  </Link>
                ))
              }
            </div>
          </div>
        </section>
      )}

      {/* Футер */}
      <footer className="bg-gray-900 text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Local Board MVP</h2>
          <p className="text-gray-400 mb-8">Создано для поддержки локального бизнеса.</p>
          <div className="text-sm text-gray-600">
            &copy; 2026 Все права защищены.
          </div>
        </div>
      </footer>

    </main>
  );
}