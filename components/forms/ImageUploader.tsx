'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import { X, Upload, ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
}

export function ImageUploader({
  images,
  onImagesChange,
  maxImages = 10,
  className,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Загрузка изображения в Supabase Storage
  const uploadImage = useCallback(
    async (file: File): Promise<string | null> => {
      try {
        setUploadError(null);
        
        // Валидация файла
        if (!file.type.startsWith('image/')) {
          throw new Error('Файл должен быть изображением');
        }
        
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Размер файла не должен превышать 5 МБ');
        }

        // Создаем FormData для загрузки
        const formData = new FormData();
        formData.append('file', file);

        // Загружаем через API route
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Ошибка загрузки');
        }

        const data = await response.json();
        return data.url;
      } catch (error) {
        console.error('Upload error:', error);
        setUploadError(error instanceof Error ? error.message : 'Ошибка загрузки');
        return null;
      }
    },
    []
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const remainingSlots = maxImages - images.length;
      const filesToUpload = Array.from(files).slice(0, remainingSlots);

      if (filesToUpload.length === 0) {
        setUploadError(`Максимум ${maxImages} изображений`);
        return;
      }

      setIsUploading(true);
      setUploadError(null);

      const uploadedUrls: string[] = [];
      
      for (const file of filesToUpload) {
        const url = await uploadImage(file);
        if (url) {
          uploadedUrls.push(url);
        }
      }

      if (uploadedUrls.length > 0) {
        onImagesChange([...images, ...uploadedUrls]);
      }

      setIsUploading(false);
      
      // Сброс input
      e.target.value = '';
    },
    [images, maxImages, onImagesChange, uploadImage]
  );

  const handleRemoveImage = useCallback(
    (index: number) => {
      const newImages = [...images];
      newImages.splice(index, 1);
      onImagesChange(newImages);
    },
    [images, onImagesChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      
      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/')
      );

      if (files.length === 0) return;

      const remainingSlots = maxImages - images.length;
      const filesToUpload = files.slice(0, remainingSlots);

      if (filesToUpload.length === 0) {
        setUploadError(`Максимум ${maxImages} изображений`);
        return;
      }

      setIsUploading(true);
      setUploadError(null);

      const uploadedUrls: string[] = [];
      
      for (const file of filesToUpload) {
        const url = await uploadImage(file);
        if (url) {
          uploadedUrls.push(url);
        }
      }

      if (uploadedUrls.length > 0) {
        onImagesChange([...images, ...uploadedUrls]);
      }

      setIsUploading(false);
    },
    [images, maxImages, onImagesChange, uploadImage]
  );

  const canAddMore = images.length < maxImages;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Загруженные изображения */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {images.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="relative aspect-square rounded-lg overflow-hidden group border border-gray-200"
            >
              <Image
                src={url}
                alt={`Изображение ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 33vw, 20vw"
              />
              
              {/* Overlay с кнопкой удаления */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveImage(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              
              {/* Индикатор главного изображения */}
              {index === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-xs text-center py-0.5">
                  Главное
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Зона загрузки */}
      {canAddMore && (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            'relative border-2 border-dashed rounded-xl p-6 sm:p-8',
            'flex flex-col items-center justify-center gap-3',
            'transition-colors cursor-pointer',
            isUploading
              ? 'border-blue-300 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          )}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            disabled={isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-600">Загрузка...</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <Upload className="w-5 h-5 text-gray-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  Нажмите или перетащите фото
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG до 5 МБ ({images.length}/{maxImages})
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Ошибка загрузки */}
      {uploadError && (
        <p className="text-sm text-red-500">{uploadError}</p>
      )}

      {/* Подсказка */}
      {images.length > 0 && (
        <p className="text-xs text-gray-500">
          Первое изображение будет главным. Перетащите изображения в нужном порядке.
        </p>
      )}
    </div>
  );
}

// Упрощенная версия для превью (без загрузки)
export function ImagePreview({
  images,
  onRemove,
  className,
}: {
  images: string[];
  onRemove?: (index: number) => void;
  className?: string;
}) {
  if (images.length === 0) return null;

  return (
    <div className={cn('grid grid-cols-3 sm:grid-cols-4 gap-3', className)}>
      {images.map((url, index) => (
        <div
          key={`${url}-${index}`}
          className="relative aspect-square rounded-lg overflow-hidden group border border-gray-200"
        >
          <Image
            src={url}
            alt={`Изображение ${index + 1}`}
            fill
            className="object-cover"
            sizes="20vw"
          />
          
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
