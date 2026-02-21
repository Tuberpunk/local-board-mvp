'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, Package, Wrench, Loader2, AlertCircle, CheckCircle2, ImagePlus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { productFormSchema, ProductFormSchema } from '@/lib/utils/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUploader } from '@/components/forms/ImageUploader';
import { Category } from '@/types/category';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function AddProductPage() {
  const router = useRouter();
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shopId, setShopId] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting }, reset } = useForm<ProductFormSchema>({
    resolver: zodResolver(productFormSchema),
    defaultValues: { type: 'good', price_from: false, is_available: true, images: [] },
  });

  const selectedType = watch('type');
  const selectedImages = watch('images');

  useEffect(() => {
    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return router.push('/login');

        // ИЗМЕНЕНИЕ: Получаем все магазины, а не один
        const { data: shops } = await supabase.from('shops').select('id').eq('profile_id', session.user.id);
        
        if (!shops || shops.length === 0) return router.push('/dashboard/create-shop');
        
        // ИЗМЕНЕНИЕ: Берем активный магазин из кеша, либо первый по умолчанию
        const savedShopId = localStorage.getItem('activeShopId');
        const activeShop = shops.find(s => s.id === savedShopId) || shops[0];
        
        setShopId(activeShop.id);

        const { data: cats } = await supabase.from('categories').select('*').order('sort_order');
        setCategories(cats || []);
      } catch (e) { 
        console.error(e); 
      } finally { 
        setIsLoading(false); 
      }
    }
    init();
  }, [router, supabase]);

const onSubmit = async (data: ProductFormSchema) => {
    try {
      if (!shopId) return;
      const { error } = await supabase.from('products').insert({ ...data, shop_id: shopId, is_active: true });
      if (error) throw error;
      
      toast.success('Объявление опубликовано!');
      reset();
      router.push('/dashboard');
    } catch (e) { 
      toast.error('Ошибка при публикации объявления'); 
    }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  // ... (Остальной JSX код формы возврата точно такой же, как в твоем файле)
  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-30 px-4 h-16 flex items-center justify-between max-w-5xl mx-auto w-full rounded-b-2xl sm:rounded-none">
        <div className="flex items-center gap-3 text-gray-800">
          <Link href="/dashboard" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft className="w-5 h-5" /></Link>
          <span className="font-bold text-lg tracking-tight">Новое объявление</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* 1. Тип объявления */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              1. Что вы предлагаете?
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'good', label: 'Товар', icon: Package, desc: 'Вещи, электроника...' },
                { id: 'service', label: 'Услуга', icon: Wrench, desc: 'Ремонт, уроки...' }
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => setValue('type', item.id as any)}
                  className={cn(
                    "cursor-pointer relative overflow-hidden rounded-2xl border-2 p-5 transition-all hover:scale-[1.02]",
                    selectedType === item.id 
                      ? "border-blue-600 bg-blue-50/50 shadow-md ring-1 ring-blue-600/20" 
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                  )}
                >
                  <item.icon className={cn("w-8 h-8 mb-3", selectedType === item.id ? "text-blue-600" : "text-gray-400")} />
                  <div className="font-bold text-gray-900">{item.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Фотографии */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <ImagePlus className="w-5 h-5 text-blue-600" /> Фотографии
              </h3>
              <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                {selectedImages.length} / 10
              </span>
            </div>
            <div className="bg-gray-50 rounded-xl p-2 border border-dashed border-gray-300">
               <ImageUploader images={selectedImages} onImagesChange={(imgs) => setValue('images', imgs)} maxImages={10} />
            </div>
          </div>

          {/* 3. Описание */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
            <h3 className="font-semibold text-gray-900">Детали объявления</h3>
            
            <div className="grid gap-5">
              <div className="space-y-1.5">
                <Label className="text-gray-700">Название</Label>
                <Input placeholder="Например: iPhone 15 Pro, как новый" {...register('title')} className="h-12 bg-gray-50 border-transparent hover:bg-white hover:border-gray-200 focus:bg-white transition-all text-lg" />
                {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-gray-700">Категория</Label>
                <Select onValueChange={(v) => setValue('category_id', v === 'none' ? null : v)}>
                  <SelectTrigger className="h-12 bg-gray-50 border-transparent hover:bg-white hover:border-gray-200 focus:bg-white"><SelectValue placeholder="Выберите категорию" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-gray-700">Описание</Label>
                <Textarea placeholder="Расскажите о преимуществах и состоянии..." {...register('description')} className="min-h-[120px] bg-gray-50 border-transparent hover:bg-white hover:border-gray-200 focus:bg-white transition-all resize-none" />
                {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
              </div>
            </div>
          </div>

          {/* 4. Цена */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
            <h3 className="font-semibold text-gray-900">Стоимость</h3>
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1 space-y-1.5">
                <Label>Цена (₽)</Label>
                <div className="relative">
                  <Input type="number" placeholder="0" {...register('price', { valueAsNumber: true })} className="pl-4 h-12 text-lg font-medium bg-gray-50 border-transparent hover:bg-white hover:border-gray-200 focus:bg-white" />
                  <span className="absolute right-4 top-3 text-gray-400 font-medium">₽</span>
                </div>
              </div>
              <div className="flex items-center gap-4 sm:pt-6">
                 {selectedType === 'service' && (
                    <div className="flex items-center gap-2">
                      <Switch id="price_from" onCheckedChange={(c) => setValue('price_from', c)} />
                      <Label htmlFor="price_from" className="cursor-pointer">Цена "от"</Label>
                    </div>
                 )}
                 <div className="flex items-center gap-2">
                    <Switch id="is_available" defaultChecked onCheckedChange={(c) => setValue('is_available', c)} />
                    <Label htmlFor="is_available" className="cursor-pointer">Активно</Label>
                 </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 pb-10">
            <Button type="submit" disabled={isSubmitting} className="w-full h-14 text-lg bg-gray-900 hover:bg-black text-white rounded-xl shadow-lg shadow-gray-900/20 transition-all hover:-translate-y-1 active:translate-y-0">
              {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : 'Опубликовать объявление'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}