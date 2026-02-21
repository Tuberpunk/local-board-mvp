import { createClient } from '@/lib/supabase/client';
import { ProductCard } from '@/components/product/ProductCard';
import { CatalogFilters } from '@/components/catalog/CatalogFilters';
import { PackageSearch } from 'lucide-react';
import Link from 'next/link';

type Props = {
  searchParams: { [key: string]: string | string[] | undefined }
};

export const dynamic = 'force-dynamic';

export default async function CatalogPage({ searchParams }: Props) {
  const supabase = createClient();
  
  const q = typeof searchParams.q === 'string' ? searchParams.q : '';
  const categoryId = typeof searchParams.category === 'string' ? searchParams.category : '';
  const type = typeof searchParams.type === 'string' ? searchParams.type : 'all';
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : 'newest';
  
  // Парсим параметры цены
  const minPriceStr = typeof searchParams.min_price === 'string' ? searchParams.min_price : '';
  const maxPriceStr = typeof searchParams.max_price === 'string' ? searchParams.max_price : '';
  const minPrice = minPriceStr ? parseInt(minPriceStr) : 0;
  const maxPrice = maxPriceStr ? parseInt(maxPriceStr) : null;

  const { data: categories } = await supabase.from('categories').select('id, name').order('name');

  // 1. ПОЛУЧАЕМ МАКСИМАЛЬНУЮ ЦЕНУ (Без учета фильтров цены, чтобы ползунок не сжимался)
  let maxPriceQuery = supabase.from('products').select('price').eq('is_active', true);
  if (q) maxPriceQuery = maxPriceQuery.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  if (categoryId) maxPriceQuery = maxPriceQuery.eq('category_id', categoryId);
  if (type === 'good') maxPriceQuery = maxPriceQuery.eq('type', 'good');
  else if (type === 'service') maxPriceQuery = maxPriceQuery.eq('type', 'service');

  const { data: maxPriceData } = await maxPriceQuery.order('price', { ascending: false }).limit(1);
  const maxAvailablePrice = maxPriceData?.[0]?.price || 10000; // По умолчанию 10000, если товаров нет

  // 2. ОСНОВНОЙ ЗАПРОС С УЧЕТОМ ЦЕНЫ
  let query = supabase
    .from('products')
    .select(`
      *,
      shop:shops (name, slug),
      category:categories (name, slug)
    `)
    .eq('is_active', true)
    .limit(50);

  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  if (categoryId) query = query.eq('category_id', categoryId);
  if (type === 'good') query = query.eq('type', 'good');
  else if (type === 'service') query = query.eq('type', 'service');

  // Применяем фильтры цены
  if (minPrice > 0) query = query.gte('price', minPrice);
  if (maxPrice !== null) query = query.lte('price', maxPrice);

  switch (sort) {
    case 'cheap': query = query.order('price', { ascending: true }); break;
    case 'expensive': query = query.order('price', { ascending: false }); break;
    case 'newest':
    default: query = query.order('created_at', { ascending: false }); break;
  }

  const { data: products } = await query;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200 py-8 mb-8">
         <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Каталог объявлений</h1>
            <p className="text-gray-500">Найдите то, что нужно, среди тысяч предложений.</p>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        
        {/* Передаем максимальную цену в компонент фильтров */}
        <CatalogFilters categories={categories || []} maxAvailablePrice={maxAvailablePrice} />

        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <PackageSearch className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Ничего не найдено</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Попробуйте изменить параметры поиска или выбрать другую категорию.
            </p>
            <Link 
              href="/catalog" 
              className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Сбросить фильтры
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}