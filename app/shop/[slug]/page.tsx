import { createClient } from '@/lib/supabase/client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Calendar, Star, Store, CheckCircle2, ArrowLeft } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { Product } from '@/types/product';
import { ContactButtons } from '@/components/product/ContactButtons';
import dynamicImport from 'next/dynamic'; // Переименовал, чтобы не конфликтовало с переменной dynamic

// 1. ВАЖНОЕ ИСПРАВЛЕНИЕ: Отключаем кэширование
export const dynamic = 'force-dynamic'; 

const ShopLocationMap = dynamicImport(() => import('@/components/ui/ShopLocationMap'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 rounded-xl animate-pulse mt-4 flex items-center justify-center text-gray-400">Загрузка карты...</div>
});

export default async function ShopPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();

  // Декодируем slug (для русских названий)
  const slug = decodeURIComponent(params.slug);

  const { data: shop, error } = await supabase
    .from('shops')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !shop) {
    notFound();
  }

  // Загружаем товары (теперь всегда свежие)
  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      shop:shops (name, slug),
      category:categories (name, slug)
    `)
    .eq('shop_id', shop.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false }); // Сначала новые

  const fullAddress = [shop.city, shop.address].filter(Boolean).join(', ');
  const hasContacts = shop.contact_phone || shop.contact_whatsapp || shop.contact_telegram || shop.contact_email;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* Навигация */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 lg:static lg:border-none">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center">
           <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium">
             <ArrowLeft className="w-5 h-5" /> На главную
           </Link>
        </div>
      </div>

      {/* Обложка */}
      <div className="h-40 sm:h-52 bg-gradient-to-r from-gray-900 to-blue-900 relative overflow-hidden -mt-14 lg:mt-0">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Левая колонка: Инфо */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">
              
              <div className="w-28 h-28 rounded-3xl bg-white p-1 shadow-lg -mt-20 mb-6 mx-auto lg:mx-0">
                <div className="w-full h-full bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100">
                  {shop.avatar_url ? (
                    <img src={shop.avatar_url} alt={shop.name} className="w-full h-full object-cover" />
                  ) : (
                    <Store className="w-10 h-10 text-gray-300" />
                  )}
                </div>
              </div>

              <div className="text-center lg:text-left mb-6">
                <h1 className="text-3xl font-extrabold text-gray-900 flex items-center justify-center lg:justify-start gap-2 mb-2">
                  {shop.name}
                  <CheckCircle2 className="w-6 h-6 text-blue-500" />
                </h1>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm font-medium">
                   <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-lg">
                      <Star className="w-4 h-4 fill-yellow-500" /> 5.0
                   </span>
                   <span className="text-gray-400">
                     На сайте с {new Date(shop.created_at).getFullYear()}
                   </span>
                </div>
              </div>

              {shop.description && (
                <div className="text-gray-600 text-sm leading-relaxed mb-6 border-t border-gray-100 pt-4 text-center lg:text-left">
                  {shop.description}
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Адрес магазина</h3>
                <div className="flex items-start gap-3 text-gray-800">
                  <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">
                    {fullAddress || 'Адрес не указан'}
                  </span>
                </div>
              </div>

              {hasContacts ? (
                <div className="space-y-4">
                   <ContactButtons 
                      contacts={{
                        phone: shop.contact_phone,
                        whatsapp: shop.contact_whatsapp,
                        telegram: shop.contact_telegram,
                        email: shop.contact_email
                      }}
                   />
                </div>
              ) : (
                <p className="text-center text-gray-400 text-sm italic">Контакты скрыты</p>
              )}

              {(shop.city || shop.address) && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">На карте</h3>
                  <ShopLocationMap city={shop.city} address={shop.address} />
                </div>
              )}

            </div>
          </div>

          {/* Правая колонка: Товары */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-6">
               <h2 className="text-2xl font-bold text-gray-900">Товары и услуги</h2>
               <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm font-bold">
                 {products?.length || 0}
               </span>
            </div>

            {products && products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product as Product} 
                    showShop={false} 
                    className="shadow-sm border-gray-100 hover:border-blue-200"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
                <Store className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Витрина пуста</h3>
                <p className="text-gray-500">В этом магазине пока нет активных объявлений.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}