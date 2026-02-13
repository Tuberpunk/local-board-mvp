'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, MapPin, Store } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { formatPrice, formatDate } from '@/lib/utils/formatters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
  className?: string;
  showShop?: boolean;
  onFavoriteToggle?: (productId: string) => void;
  isFavorite?: boolean;
}

export function ProductCard({
  product,
  className,
  showShop = true,
  onFavoriteToggle,
  isFavorite = false,
}: ProductCardProps) {
  const mainImage = product.images?.[0] || '/images/placeholder-product.svg';
  const hasMultipleImages = product.images && product.images.length > 1;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavoriteToggle?.(product.id);
  };

  return (
    <Link
      href={`/product/${product.id}`}
      className={cn(
        'group block bg-white rounded-xl overflow-hidden border border-gray-100',
        'shadow-sm hover:shadow-md transition-shadow duration-200',
        'active:scale-[0.98] transition-transform',
        className
      )}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Image
          src={mainImage}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Image Counter */}
        {hasMultipleImages && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            {product.images.length} фото
          </div>
        )}
        
        {/* Favorite Button */}
        {onFavoriteToggle && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'absolute top-2 right-2 w-8 h-8 rounded-full',
              'bg-white/90 hover:bg-white shadow-sm',
              'opacity-0 group-hover:opacity-100 transition-opacity',
              'focus:opacity-100'
            )}
            onClick={handleFavoriteClick}
            aria-label={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
          >
            <Heart
              className={cn(
                'w-4 h-4 transition-colors',
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
              )}
            />
          </Button>
        )}
        
        {/* Type Badge */}
        <Badge
          variant="secondary"
          className={cn(
            'absolute top-2 left-2 text-xs',
            product.type === 'service' 
              ? 'bg-purple-100 text-purple-700' 
              : 'bg-blue-100 text-blue-700'
          )}
        >
          {product.type === 'service' ? 'Услуга' : 'Товар'}
        </Badge>
        
        {/* Availability Badge */}
        {!product.is_available && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              Нет в наличии
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        {/* Price */}
        <div className="mb-1.5">
          <span className="text-lg sm:text-xl font-bold text-gray-900">
            {formatPrice(product.price, product.price_from)}
          </span>
        </div>
        
        {/* Title */}
        <h3 className="text-sm sm:text-base font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
          {product.title}
        </h3>
        
        {/* Shop Info */}
        {showShop && product.shop && (
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 mb-2">
            <Store className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{product.shop.name}</span>
          </div>
        )}
        
        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{formatDate(product.created_at)}</span>
          {product.views_count > 0 && (
            <span>{product.views_count} просмотров</span>
          )}
        </div>
      </div>
    </Link>
  );
}

// Skeleton loader для ProductCard
export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(
      'bg-white rounded-xl overflow-hidden border border-gray-100',
      className
    )}>
      <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
      <div className="p-3 sm:p-4 space-y-3">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-2/3" />
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="flex justify-between">
          <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-16" />
        </div>
      </div>
    </div>
  );
}
