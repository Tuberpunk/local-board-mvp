'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Store, Sparkles, ArrowRight, MapPin, Phone, Mail, Send, Globe, MessageCircle } from 'lucide-react';

// 1. ДИНАМИЧЕСКИЙ ИМПОРТ КАРТЫ
import dynamic from 'next/dynamic';
const AddressMap = dynamic(() => import('@/components/forms/AddressMap'), { 
  ssr: false,
  loading: () => <div className="h-[200px] w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400">Загрузка карты...</div>
});

export default function CreateShopPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard/add-product';
  const supabase = createClient();

  // Основная информация
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');

  // Состояние карты
  const [showMap, setShowMap] = useState(false);

  // Контакты
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [telegram, setTelegram] = useState('');
  const [email, setEmail] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }

      // Генерируем slug
      const slug = name.toLowerCase()
        .replace(/[^a-z0-9а-яё]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') 
        + '-' + Math.floor(Math.random() * 1000);

      const { error } = await supabase.from('shops').insert({
        profile_id: session.user.id,
        name,
        slug,
        description,
        city,
        address,
        contact_phone: phone,
        contact_whatsapp: whatsapp,
        contact_telegram: telegram,
        contact_email: email,
        is_active: true
      });

      if (error) throw error;

      router.push(redirectPath);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Ошибка создания магазина');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 transform -rotate-6 mb-6">
            <Store className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Создайте свой магазин
          </h2>
          <p className="mt-3 text-gray-500 text-lg">
            Заполните профиль, чтобы покупатели могли найти вас на карте.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <form className="p-8 space-y-8" onSubmit={handleSubmit}>
            
            {/* БЛОК 1: Основное */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
                <Store className="w-5 h-5 text-blue-600" /> Основная информация
              </h3>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Название магазина *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    className="block w-full h-12 pl-4 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                    placeholder="Например: Эко-Лавка"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <Sparkles className="absolute right-4 top-3.5 h-5 w-5 text-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Описание</label>
                <textarea
                  rows={3}
                  className="block w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none"
                  placeholder="Расскажите покупателям, чем вы торгуете..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            {/* БЛОК 2: Локация + КАРТА */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" /> Адрес и Город
                </h3>
                <button 
                  type="button"
                  onClick={() => setShowMap(!showMap)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1 rounded-lg transition-colors"
                >
                  {showMap ? 'Скрыть карту' : 'Выбрать на карте'}
                </button>
              </div>

              {/* Карта (появляется при клике) */}
              {showMap && (
                <div className="animate-in fade-in zoom-in-95 duration-200 border border-blue-100 rounded-xl overflow-hidden shadow-sm">
                  <AddressMap onAddressSelect={(data) => {
                    if (data.city) setCity(data.city);
                    if (data.address) setAddress(data.address);
                  }} />
                  <div className="bg-blue-50 px-4 py-2 text-xs text-blue-700 text-center">
                    Нажмите на здание, чтобы автоматически заполнить адрес
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Город</label>
                  <input
                    type="text"
                    className="block w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                    placeholder="Атбасар"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Адрес (улица, дом)</label>
                  <input
                    type="text"
                    className="block w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                    placeholder="ул. Пушкина, д. 10"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* БЛОК 3: Контакты */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
                <Phone className="w-5 h-5 text-purple-600" /> Контакты для связи
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Телефон</label>
                  <input
                    type="tel"
                    className="block w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                    placeholder="+7 (999) 000-00-00"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email (для клиентов)</label>
                  <input
                    type="email"
                    className="block w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                    placeholder="shop@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-green-600"/> WhatsApp (номер)
                  </label>
                  <input
                    type="text"
                    className="block w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                    placeholder="79990000000"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-500"/> Telegram (username)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-400">@</span>
                    <input
                      type="text"
                      className="block w-full h-12 pl-8 pr-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                      placeholder="username"
                      value={telegram}
                      onChange={(e) => setTelegram(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !name}
              className="w-full h-14 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
              {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : <>Создать магазин <ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}