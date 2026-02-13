'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  ChevronLeft, 
  Package, 
  Wrench, 
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { productFormSchema, ProductFormSchema } from '@/lib/utils/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ImageUploader } from '@/components/forms/ImageUploader';
import { Category } from '@/types/category';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Типы для формы
const productTypes = [
  { value: 'good', label: 'Товар', icon: Package, description: 'Физический товар с наличием' },
  { value: 'service', label: 'Услуга', icon: Wrench, description: 'Услуга с ценой "от"' },
] as const;

export default function AddProductPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [shopId, setShopId] = useState<string | null>(null);

  // Загрузка категорий и проверка магазина
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      
      try {
        // Проверяем авторизацию
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/login?redirect=/dashboard/add-product');
          return;
        }

        // Загружаем категории
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('sort_order', { ascending: true });

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

        // Проверяем, есть ли у пользователя магазин
        const { data: shopData, error: shopError } = await supabase
          .from('shops')
          .select('id')
          .eq('profile_id', session.user.id)
          .single();

        if (shopError && shopError.code !== 'PGRST116') {
          throw shopError;
        }

        if (!shopData) {
          // Перенаправляем на создание магазина
          router.push('/dashboard/create-shop?redirect=/dashboard/add-product');
          return;
        }

        setShopId(shopData.id);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Ошибка загрузки данных. Попробуйте позже.');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [router, supabase]);

  // React Hook Form
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
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
      images: [],
    },
  });

  const selectedType = watch('type');
  const selectedImages = watch('images');
  const priceFrom = watch('price_from');

  // Обработчик отправки формы
  const onSubmit = async (data: ProductFormSchema) => {
    if (!shopId) {
      setError('Магазин не найден. Создайте магазин перед добавлением товаров.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('products')
        .insert({
          shop_id: shopId,
          title: data.title,
          description: data.description,
          type: data.type,
          price: data.price,
          price_from: data.price_from,
          is_available: data.is_available,
          category_id: data.category_id,
          images: data.images,
          is_active: true,
        });

      if (insertError) {
        if (insertError.code === '23514') {
          throw new Error('Проверьте правильность заполнения полей');
        }
        throw insertError;
      }

      setSuccess(true);
      
      // Сбрасываем форму
      reset();
      
      // Перенаправляем через 1.5 секунды
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1500);
    } catch (err) {
      console.error('Error creating product:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Ошибка при создании объявления. Попробуйте позже.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Загрузка...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-semibold text-lg">Новое объявление</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Success Message */}
        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Объявление успешно создано! Перенаправляем...
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Тип объявления */}
          <section className="bg-white rounded-xl p-4 sm:p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Тип объявления</h2>
            
            <div className="grid grid-cols-2 gap-3">
              {productTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.value;
                
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setValue('type', type.value)}
                    className={cn(
                      'p-4 rounded-xl border-2 text-left transition-all',
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <Icon className={cn(
                      'w-6 h-6 mb-2',
                      isSelected ? 'text-blue-600' : 'text-gray-500'
                    )} />
                    <p className={cn(
                      'font-medium',
                      isSelected ? 'text-blue-900' : 'text-gray-900'
                    )}>
                      {type.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {type.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Фотографии */}
          <section className="bg-white rounded-xl p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Фотографии</h2>
              <span className="text-sm text-gray-500">
                {selectedImages.length}/10
              </span>
            </div>
            
            <ImageUploader
              images={selectedImages}
              onImagesChange={(images) => setValue('images', images)}
              maxImages={10}
            />
          </section>

          {/* Основная информация */}
          <section className="bg-white rounded-xl p-4 sm:p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Описание</h2>
            
            {/* Название */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Название <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Например: iPhone 14 Pro 256GB"
                {...register('title')}
                className={cn(errors.title && 'border-red-500')}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* Описание */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Описание <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Подробно опишите товар или услугу..."
                rows={5}
                {...register('description')}
                className={cn(errors.description && 'border-red-500')}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            {/* Категория */}
            <div className="space-y-2">
              <Label htmlFor="category">Категория</Label>
              <Select
                value={watch('category_id') || 'none'}
                onValueChange={(value) => 
                  setValue('category_id', value === 'none' ? null : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Без категории</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          {/* Цена и наличие */}
          <section className="bg-white rounded-xl p-4 sm:p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Цена и наличие</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Цена */}
              <div className="space-y-2">
                <Label htmlFor="price">
                  Цена {selectedType === 'service' && '(необязательно)'}
                </Label>
                <div className="relative">
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    {...register('price', { valueAsNumber: true })}
                    className={cn(
                      'pl-3 pr-12',
                      errors.price && 'border-red-500'
                    )}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    ₽
                  </span>
                </div>
                {errors.price && (
                  <p className="text-sm text-red-500">{errors.price.message}</p>
                )}
              </div>

              {/* Дополнительные опции */}
              <div className="space-y-3 sm:pt-7">
                {/* Цена "от" (для услуг) */}
                {selectedType === 'service' && (
                  <div className="flex items-center justify-between">
                    <Label htmlFor="price_from" className="cursor-pointer">
                      Цена "от"
                      <span className="block text-xs text-gray-500 font-normal">
                        Укажите, если цена может варьироваться
                      </span>
                    </Label>
                    <Switch
                      id="price_from"
                      checked={priceFrom}
                      onCheckedChange={(checked) => 
                        setValue('price_from', checked)
                      }
                    />
                  </div>
                )}

                {/* В наличии */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_available" className="cursor-pointer">
                    В наличии / Доступно
                  </Label>
                  <Switch
                    id="is_available"
                    checked={watch('is_available')}
                    onCheckedChange={(checked) => 
                      setValue('is_available', checked)
                    }
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Кнопки */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={() => router.push('/dashboard')}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting || success}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Создание...
                </>
              ) : (
                'Опубликовать'
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
