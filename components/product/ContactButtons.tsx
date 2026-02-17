'use client'

import { useState } from 'react';
import { Phone, MessageCircle, X, Send, Mail, Globe } from 'lucide-react';

type ContactProps = {
  phone: string | null;
  whatsapp: string | null;
  telegram: string | null;
  email: string | null;
};

export function ContactButtons({ contacts }: { contacts: ContactProps }) {
  const [showPhone, setShowPhone] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hasMessengers = contacts.whatsapp || contacts.telegram || contacts.email;

  // Форматирование ссылки WhatsApp
  const getWhatsappLink = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}`;
  };

  // Форматирование ссылки Telegram
  const getTelegramLink = (username: string) => {
    const cleanName = username.replace('@', '');
    return `https://t.me/${cleanName}`;
  };

  return (
    <>
      <div className="space-y-3">
        {/* Кнопка ТЕЛЕФОН */}
        {contacts.phone ? (
          <button 
            onClick={() => setShowPhone(true)}
            className={`w-full h-14 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${
              showPhone 
                ? 'bg-white border-2 border-green-500 text-green-600' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 hover:-translate-y-0.5'
            }`}
          >
            <Phone className="w-5 h-5" /> 
            {showPhone ? (
              <a href={`tel:${contacts.phone}`} className="hover:underline">{contacts.phone}</a>
            ) : (
              "Показать телефон"
            )}
          </button>
        ) : (
          <button disabled className="w-full h-14 bg-gray-100 text-gray-400 rounded-xl font-bold flex items-center justify-center gap-2 cursor-not-allowed">
             <Phone className="w-5 h-5" /> Телефон скрыт
          </button>
        )}

        {/* Кнопка СООБЩЕНИЕ */}
        <button 
          onClick={() => setIsModalOpen(true)}
          disabled={!hasMessengers}
          className="w-full h-14 bg-white border-2 border-gray-200 hover:border-gray-900 text-gray-900 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MessageCircle className="w-5 h-5" /> Написать сообщение
        </button>
      </div>

      {/* МОДАЛЬНОЕ ОКНО С МЕССЕНДЖЕРАМИ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative">
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Связаться с продавцом</h3>
            
            <div className="space-y-3">
              {contacts.whatsapp && (
                <a 
                  href={getWhatsappLink(contacts.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-colors font-semibold"
                >
                  <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  Написать в WhatsApp
                </a>
              )}

              {contacts.telegram && (
                <a 
                  href={getTelegramLink(contacts.telegram)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors font-semibold"
                >
                  <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center">
                    <Send className="w-5 h-5 ml-0.5" />
                  </div>
                  Написать в Telegram
                </a>
              )}

              {contacts.email && (
                <a 
                  href={`mailto:${contacts.email}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors font-semibold"
                >
                  <div className="w-10 h-10 bg-gray-700 text-white rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  Написать на Email
                </a>
              )}

              {!hasMessengers && (
                <p className="text-center text-gray-500 py-4">
                  У продавца нет доступных мессенджеров.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}