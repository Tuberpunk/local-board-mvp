'use client';

import Image from 'next/image';
import Link from 'next/link';
import { 
  Phone, 
  MessageCircle, 
  Send, 
  MapPin, 
  Mail, 
  Package,
  Clock,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { formatPhoneNumber } from '@/lib/utils/formatters';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shop } from '@/types/shop';

interface ShopHeaderProps {
  shop: Shop;
  productsCount?: number;
  className?: string;
  showBackButton?: boolean;
}

export function ShopHeader({ 
  shop, 
  productsCount = 0, 
  className,
  showBackButton = true 
}: ShopHeaderProps) {
  const hasContacts = shop.contact_phone || shop.contact_whatsapp || shop.contact_telegram;
  
  // Формируем ссылки для связи
  const getWhatsAppLink = (phone: string | null) => {
    if (!phone) return '#';
    const cleaned = phone.replace(/\D/g, '');
    return `https://wa.me/${cleaned}`;
  };
  
  const getTelegramLink = (username: string | null) => {
    if (!username) return '#';
    const cleanUsername = username.replace('@', '');
    return `https://t.me/${cleanUsername}`;
  };
  
  const getPhoneLink = (phone: string | null) => {
    if (!phone) return '#';
    const cleaned = phone.replace(/\D/g, '');
    return `tel:+${cleaned}`;
  };

  return (
    <div className={cn('bg-white', className)}>
      {/* Cover Image */}
      <div className="relative h-32 sm:h-48 bg-gradient-to-br from-blue-100 to-purple-100">
        {shop.cover_url ? (
          <Image
            src={shop.cover_url}
            alt={shop.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50" />
        )}
        
        {/* Back Button */}
        {showBackButton && (
          <Link
            href="/"
            className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 hover:bg-white transition-colors shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Назад
          </Link>
        )}
      </div>

      {/* Profile Section */}
      <div className="px-4 sm:px-6 pb-6">
        <div className="relative flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-16">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-4 border-white bg-white shadow-lg">
              {shop.avatar_url ? (
                <Image
                  src={shop.avatar_url}
                  alt={shop.name}
                  width={128}
                  height={128}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl sm:text-4xl font-bold">
                  {shop.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pt-2 sm:pb-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              {shop.name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-500">
              <Badge variant="secondary" className="font-normal">
                <Package className="w-3.5 h-3.5 mr-1" />
                {productsCount} {getProductsLabel(productsCount)}
              </Badge>
              
              {shop.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {shop.city}
                </span>
              )}
            </div>
          </div>

          {/* Contact Buttons */}
          {hasContacts && (
            <div className="flex flex-wrap gap-2 sm:pb-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Связаться
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Связаться с продавцом</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 mt-4">
                    {shop.contact_whatsapp && (
                      <a
                        href={getWhatsAppLink(shop.contact_whatsapp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                          <MessageCircle className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">WhatsApp</p>
                          <p className="text-sm text-gray-500">
                            {formatPhoneNumber(shop.contact_whatsapp)}
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </a>
                    )}
                    
                    {shop.contact_telegram && (
                      <a
                        href={getTelegramLink(shop.contact_telegram)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <Send className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">Telegram</p>
                          <p className="text-sm text-gray-500">
                            {shop.contact_telegram.startsWith('@') 
                              ? shop.contact_telegram 
                              : `@${shop.contact_telegram}`}
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </a>
                    )}
                    
                    {shop.contact_phone && (
                      <a
                        href={getPhoneLink(shop.contact_phone)}
                        className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                          <Phone className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">Позвонить</p>
                          <p className="text-sm text-gray-500">
                            {formatPhoneNumber(shop.contact_phone)}
                          </p>
                        </div>
                      </a>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        {/* Description */}
        {shop.description && (
          <div className="mt-4 sm:mt-6">
            <p className="text-sm sm:text-base text-gray-600 whitespace-pre-line">
              {shop.description}
            </p>
          </div>
        )}

        {/* Contact Info Bar */}
        <div className="mt-4 sm:mt-6 flex flex-wrap gap-3 text-sm">
          {shop.address && (
            <div className="flex items-center gap-1.5 text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400" />
              {shop.address}
            </div>
          )}
          
          {shop.contact_email && (
            <a 
              href={`mailto:${shop.contact_email}`}
              className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Mail className="w-4 h-4 text-gray-400" />
              {shop.contact_email}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// Вспомогательная функция для склонения слова "товар"
function getProductsLabel(count: number): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'товаров';
  }
  
  if (lastDigit === 1) {
    return 'товар';
  }
  
  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'товара';
  }
  
  return 'товаров';
}

// Skeleton loader для ShopHeader
export function ShopHeaderSkeleton() {
  return (
    <div className="bg-white">
      <div className="h-32 sm:h-48 bg-gray-200 animate-pulse" />
      <div className="px-4 sm:px-6 pb-6">
        <div className="relative flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-16">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gray-200 animate-pulse border-4 border-white" />
          <div className="flex-1 space-y-3 pt-2 sm:pb-2">
            <div className="h-7 sm:h-8 bg-gray-200 rounded animate-pulse w-48" />
            <div className="h-5 bg-gray-200 rounded animate-pulse w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}
