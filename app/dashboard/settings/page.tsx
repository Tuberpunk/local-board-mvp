'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Save, Store, MapPin, Phone, Globe, MessageCircle, Trash2, AlertTriangle } from 'lucide-react';
import { ImageUploader } from '@/components/forms/ImageUploader';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import Image from 'next/image';

const AddressMap = dynamic(() => import('@/components/forms/AddressMap'), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400">Загрузка карты...</div>
});

export default function ShopSettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [shopId, setShopId] = useState<string | null>(null);
  
  // Данные формы
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [avatar, setAvatar] = useState<string[]>([]);

  const [productCount, setProductCount] = useState(0);
  
  // Контакты
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [telegram, setTelegram] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  // ВОТ ЭТО СОСТОЯНИЕ РЕШАЕТ ВАШУ ОШИБКУ:
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    async function loadShop() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/login');

      // Получаем ID активного магазина из памяти
      const activeShopId = localStorage.getItem('activeShopId');

      let query = supabase.from('shops').select('*').eq('profile_id', session.user.id);
      
      // Если есть сохраненный активный магазин, берем именно его
      if (activeShopId) {
        query = query.eq('id', activeShopId);
      }

      const { data: shops } = await query;
      const shop = shops?.[0]; // Берем первый найденный магазин из выборки

      if (shop) {
        setShopId(shop.id);
        setName(shop.name);
        setDescription(shop.description || '');
        setCity(shop.city || '');
        setAddress(shop.address || '');
        setPhone(shop.contact_phone || '');
        setWhatsapp(shop.contact_whatsapp || '');
        setTelegram(shop.contact_telegram || '');
        setContactEmail(shop.contact_email || '');
        if (shop.avatar_url) setAvatar([shop.avatar_url]);
        
        const { count } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('shop_id', shop.id);
        
        setProductCount(count || 0);
      }
      setLoading(false);
    }
    loadShop();
  }, [router, supabase]);

  const handleSave = async (e: React.FormEvent) => {
  e.preventDefault();
    if (!shopId) return;
    setSaving(true);

    try {
      const updates = {
        name,
        description,
        city,
        address,
        contact_phone: phone,
        contact_whatsapp: whatsapp,
        contact_telegram: telegram,
        contact_email: contactEmail,
        avatar_url: avatar.length > 0 ? avatar[0] : null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('shops').update(updates).eq('id', shopId);
      if (error) throw error;
      
      toast.success('Настройки успешно сохранены!');
      router.refresh();
    } catch (err) {
      toast.error('Ошибка при сохранении настроек');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteShop = async () => {
    if (!shopId) return;

    const confirmed = window.confirm(
      "Вы уверены, что хотите удалить магазин?\n\nВСЕ ВАШИ ТОВАРЫ БУДУТ УДАЛЕНЫ БЕЗВОЗВРАТНО.\nЭто действие нельзя отменить."
    );

    if (!confirmed) return;

    setDeleting(true);

    try {
      const { error } = await supabase.from('shops').delete().eq('id', shopId);
      if (error) throw error;

      // Очищаем кеш активного магазина при удалении
      localStorage.removeItem('activeShopId');

      toast.success('Магазин успешно удален');
      router.push('/dashboard');
      router.refresh();
    } catch (error: any) {
      console.error(error);
      alert('Ошибка при удалении: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 font-medium">
             ← Назад
          </Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-bold text-lg text-gray-900">Настройки магазина</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <form onSubmit={handleSave} className="space-y-8">
          
          {/* СЕКЦИЯ 1: Логотип и Название */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100/50 flex flex-col sm:flex-row gap-6">
            <div className="relative w-32 h-32 flex-shrink-0">
               <div className="relative w-full h-full rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
        {avatar.length > 0 ? (
          <Image 
            src={avatar[0]} 
            alt="Avatar" 
            fill 
            className="object-cover" 
            sizes="128px"
          />
                  ) : (
                    <Store className="w-10 h-10 text-gray-300" />
                  )}
               </div>
               <div className="absolute -bottom-2 -right-2">
                 <div className="bg-white rounded-full shadow-md overflow-hidden w-10 h-10 flex items-center justify-center border border-gray-100">
                    <ImageUploader 
                       images={avatar} 
                       onImagesChange={setAvatar} 
                       maxImages={1} 
                       className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    />
                    <Store className="w-5 h-5 text-blue-600 pointer-events-none" />
                 </div>
               </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Название магазина</label>
                <input 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Описание</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none"
                />
              </div>
            </div>
          </section>

          {/* СЕКЦИЯ 2: Адрес и Карта */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100/50 space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" /> Адрес и Локация
              </h3>
              <button 
                type="button"
                onClick={() => setShowMap(!showMap)}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                {showMap ? 'Скрыть карту' : 'Указать на карте'}
              </button>
            </div>

            {showMap && (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <AddressMap onAddressSelect={(data) => {
                  if (data.city) setCity(data.city);
                  if (data.address) setAddress(data.address);
                }} />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Мы постарались определить адрес. Проверьте и исправьте поля ниже, если нужно.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Город</label>
                <input 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Москва"
                  className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Адрес (улица, дом)</label>
                <input 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="ул. Ленина, 1"
                  className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                />
              </div>
            </div>
          </section>

          {/* СЕКЦИЯ 3: Контакты */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100/50 space-y-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-100">
              <Phone className="w-5 h-5 text-purple-600" /> Контакты
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Телефон</label>
                <input 
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email для связи</label>
                <input 
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-green-500" /> WhatsApp
                </label>
                <input 
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="79001234567"
                  className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-500" /> Telegram
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-400">@</span>
                  <input 
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    placeholder="username"
                    className="w-full h-12 pl-8 pr-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  />
                </div>
              </div>
            </div>
          </section>

          <button 
            type="submit" 
            disabled={saving} 
            className="w-full h-14 bg-gray-900 hover:bg-black text-white rounded-xl shadow-xl shadow-gray-900/10 font-bold text-lg transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="animate-spin" /> : <><Save className="w-5 h-5"/> Сохранить настройки</>}
          </button>
        </form>

        {/* --- СЕКЦИЯ УДАЛЕНИЯ (ОПАСНАЯ ЗОНА) --- */}
        <section className="border border-red-200 bg-red-50 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Удаление магазина
            </h3>
            <p className="text-sm text-red-600/80 mt-1 max-w-md">
              Это действие необратимо. Ваш магазин и все <span className="font-bold">{productCount}</span> товаров будут удалены без возможности восстановления.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDeleteShop}
            disabled={deleting}
            className="w-full sm:w-auto px-6 py-3 bg-white border border-red-200 text-red-600 hover:bg-red-600 hover:text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {deleting ? <Loader2 className="animate-spin w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
            Удалить магазин
          </button>
        </section>

      </main>
    </div>
  );
}