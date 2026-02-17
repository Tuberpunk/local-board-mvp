'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, Package, Wrench, Loader2, ImagePlus, Save, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { productFormSchema, ProductFormSchema } from '@/lib/utils/validators';
import { ImageUploader } from '@/components/forms/ImageUploader';
import { Category } from '@/types/category';
import { createClient } from '@/lib/supabase/client';

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Инициализация формы
  const { 
    register, 
    handleSubmit, 
    watch, 
    setValue, 
    formState: { errors, isSubmitting }, 
    reset 
  } = useForm<ProductFormSchema>({
    resolver: zodResolver(productFormSchema),
    defaultValues: { 
      title: '', 
      description: '', 
      type: 'good', 
      price: null,
      price_from: false, 
      is_available: true, 
      category_id: null,
      images: [] 
    },
  });

  const selectedType = watch('type');
  const selectedImages = watch('images');

  // Загрузка данных
  useEffect(() => {
    async function loadData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return router.push('/login');

        // 1. Загружаем категории
        const { data: cats } = await supabase.from('categories').select('*').order('sort_order');
        setCategories(cats || []);

        // 2. Загружаем товар
        const { data: product, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error || !product) {
          alert('Товар не найден');
          return router.push('/dashboard');
        }

        // 3. СБРОС ФОРМЫ С НОВЫМИ ДАННЫМИ
        // Важно: category_id приводим к строке или null, если нужно
        reset({
          title: product.title,
          description: product.description || '',
          price: product.price,
          price_from: product.price_from,
          type: product.type,
          is_available: product.is_available,
          category_id: product.category_id, 
          images: product.images || [],
        });

      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [params.id, router, supabase, reset]);

  const onSubmit = async (data: ProductFormSchema) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.id);

      if (error) throw error;
      
      router.push('/dashboard');
      router.refresh();
    } catch (e) {
      alert('Ошибка при сохранении');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) return;
    
    const { error } = await supabase.from('products').delete().eq('id', params.id);
    if (!error) {
      router.push('/dashboard');
      router.refresh();
    } else {
      alert('Ошибка удаления');
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Шапка */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900">
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <h1 className="font-bold text-lg text-gray-900">Редактирование товара</h1>
          </div>
          <button onClick={handleDelete} className="text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors" title="Удалить товар">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Тип товара */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'good', label: 'Товар', icon: Package },
              { id: 'service', label: 'Услуга', icon: Wrench }
            ].map((item) => (
              <div
                key={item.id}
                onClick={() => setValue('type', item.id as any)}
                className={cn(
                  "cursor-pointer relative rounded-2xl border-2 p-4 flex items-center gap-3 transition-all",
                  selectedType === item.id 
                    ? "border-blue-600 bg-white shadow-md ring-1 ring-blue-600/20" 
                    : "border-transparent bg-white shadow-sm opacity-60 hover:opacity-100"
                )}
              >
                <item.icon className={cn("w-5 h-5", selectedType === item.id ? "text-blue-600" : "text-gray-400")} />
                <span className="font-bold text-gray-900">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Фотографии */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100/50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <ImagePlus className="w-5 h-5 text-blue-600" /> Фотографии
              </h3>
              <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 rounded-lg text-gray-600">
                {selectedImages.length} из 10
              </span>
            </div>
            <div className="bg-gray-50/50 rounded-xl p-2 border-2 border-dashed border-gray-200">
               <ImageUploader images={selectedImages} onImagesChange={(imgs) => setValue('images', imgs)} maxImages={10} />
            </div>
          </div>

          {/* Детали (Название, Категория, Описание) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100/50 space-y-6">
            <h3 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-2">Детали</h3>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Название</label>
              <input 
                {...register('title')} 
                className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Категория</label>
              <select 
                {...register('category_id')}
                className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none appearance-none"
              >
                <option value="">Выберите категорию</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Описание</label>
              <textarea 
                rows={5} 
                {...register('description')} 
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none"
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
            </div>
          </div>

          {/* Цена и настройки */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100/50 space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Цена</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.01" 
                    {...register('price', { valueAsNumber: true })} 
                    className="w-full h-12 pl-4 pr-8 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-lg font-semibold" 
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₽</span>
                </div>
              </div>
              
              <div className="flex flex-col justify-end gap-3 pb-1">
                 {selectedType === 'service' && (
                    <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors">
                      <input type="checkbox" className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300" {...register('price_from')} />
                      <span className="text-sm font-medium text-gray-700">Указать "Цена от"</span>
                    </label>
                 )}
                 <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <input type="checkbox" className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300" {...register('is_available')} />
                    <span className="text-sm font-medium text-gray-700">Товар в наличии</span>
                 </label>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full h-14 bg-gray-900 hover:bg-black text-white rounded-xl shadow-xl shadow-gray-900/10 font-bold text-lg transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : <><Save className="w-5 h-5"/> Сохранить изменения</>}
          </button>
        </form>
      </main>
    </div>
  );
}