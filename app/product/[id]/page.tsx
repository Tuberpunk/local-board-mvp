// 1. УБИРАЕМ 'use client' из начала файла!
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next'; // 2. Импортируем типы для метадаты
import { 
  Clock, Heart, Share2, ShieldCheck, 
  Store, ArrowLeft, ChevronRight 
} from 'lucide-react';
import { ContactButtons } from '@/components/product/ContactButtons';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
};

// 3. ДОБАВЛЯЕМ ГЕНЕРАЦИЮ ДИНАМИЧЕСКИХ МЕТАТЕГОВ
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createClient();

  // Запрашиваем только те поля, которые нужны для SEO (для скорости)
  const { data } = await supabase
    .from('products')
    .select('title, description, price, images, shop:shops(name)')
    .eq('id', params.id)
    .single();

  // Приводим к any, чтобы TS не ругался на типы Supabase
  const product = data as any;

  if (!product) {
    return { title: 'Товар не найден | LocalBoard' };
  }

  const imageUrl = product.images?.[0] || 'https://via.placeholder.com/600x400?text=No+Image';
  const priceText = product.price ? `${product.price.toLocaleString('ru-RU')} ₽` : 'Цена не указана';
  
  // Безопасно достаем имя магазина (учитывая, что Supabase может вернуть как объект, так и массив)
  const shopName = Array.isArray(product.shop) ? product.shop[0]?.name : product.shop?.name;

  const seoDescription = product.description 
    ? product.description.slice(0, 150) + '...' // Обрезаем длинное описание
    : `Купить ${product.title} в магазине ${shopName || ''}`;

  return {
    title: `${product.title} за ${priceText} | LocalBoard`,
    description: seoDescription,
    openGraph: {
      title: `${product.title} - ${priceText}`,
      description: seoDescription,
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 600,
          alt: product.title,
        },
      ],
      locale: 'ru_RU',
      type: 'website',
    },
  };
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  // 1. Получаем товар + ДАННЫЕ О КОНТАКТАХ МАГАЗИНА
  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      shop:shops (
        id, name, slug, avatar_url, city, created_at,
        contact_phone, contact_whatsapp, contact_telegram, contact_email,
        products_count:products(count)
      ),
      category:categories (id, name)
    `)
    .eq('id', params.id)
    .single();

  if (error || !product) {
    notFound();
  }

  const images = product.images && product.images.length > 0 
    ? product.images 
    : ['https://via.placeholder.com/600x400?text=No+Image'];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Навигация */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-2 text-sm text-gray-500 overflow-hidden whitespace-nowrap">
          <Link href="/" className="hover:text-blue-600 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Главная
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-300" />
          <span className="hover:text-blue-600 cursor-pointer">{product.category?.name || 'Без категории'}</span>
          <ChevronRight className="w-4 h-4 text-gray-300" />
          <span className="text-gray-900 font-medium truncate">{product.title}</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ЛЕВАЯ КОЛОНКА: Фотографии */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 relative group">
            {/* Главное фото */}
            <div className="aspect-[4/3] bg-gray-100 relative flex items-center justify-center">
              <img 
                src={images[0]} 
                alt={product.title} 
                className="w-full h-full object-contain max-h-[600px] bg-gray-50"
              />
              <div className="absolute bottom-4 left-4 lg:hidden">
                <div className="bg-black/70 backdrop-blur-md text-white px-4 py-2 rounded-xl font-bold text-xl">
                  {product.price?.toLocaleString()} ₽
                </div>
              </div>
            </div>
          </div>

          {/* Миниатюры */}
          {images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((img: string, i: number) => (
                <button key={i} className={`relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 ${i === 0 ? 'border-blue-600' : 'border-transparent hover:border-gray-300'}`}>
                  <img src={img} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          )}

          {/* Описание (Десктоп) */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hidden lg:block">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Описание</h2>
            <div className="prose prose-blue text-gray-700 whitespace-pre-wrap leading-relaxed">
              {product.description}
            </div>
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА: Информация и Продавец */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Карточка товара */}
          <div className="bg-white p-6 rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <span className="text-gray-500 text-sm flex items-center gap-1">
                <Clock className="w-4 h-4" /> {formatDate(product.created_at)}
              </span>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-colors">
                  <Heart className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-blue-600 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 leading-tight">
              {product.title}
            </h1>
            
            <div className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 flex items-baseline gap-2">
              {product.price ? product.price.toLocaleString() : 'Цена не указана'} 
              <span className="text-lg font-medium text-gray-400">₽</span>
              {product.price_from && <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-md">Цена от</span>}
            </div>

            {/* ВСТАВЛЯЕМ НАШИ НОВЫЕ КНОПКИ ЗДЕСЬ */}
            <ContactButtons 
              contacts={{
                phone: product.shop?.contact_phone || null,
                whatsapp: product.shop?.contact_whatsapp || null,
                telegram: product.shop?.contact_telegram || null,
                email: product.shop?.contact_email || null,
              }}
            />
          </div>

          {/* Карточка продавца */}
          <Link href={`/shop/${product.shop?.slug}`} className="block group">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group-hover:shadow-md transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600 border border-white shadow-sm overflow-hidden">
                  {product.shop?.avatar_url ? (
                     <img src={product.shop.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                     product.shop?.name?.[0] || 'M'
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {product.shop?.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                     <span className="flex items-center gap-1"><Store className="w-3 h-3"/> {product.shop?.products_count?.[0]?.count || 0} товаров</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2 text-green-600 text-sm font-medium bg-green-50 p-3 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                  Документы проверены
                </div>
              </div>
            </div>
          </Link>
          
          {/* Описание для мобильных */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 lg:hidden">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Описание</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
          </div>

          {/* Безопасность */}
          <div className="bg-gray-100 p-5 rounded-2xl text-xs text-gray-500">
            <p className="font-semibold text-gray-700 mb-1">Советы по безопасности</p>
            Не переводите предоплату, если не уверены в надежности продавца. Встречайтесь в людных местах.
          </div>
        </div>
      </main>
    </div>
  );
}