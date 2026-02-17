'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Фикс для иконок Leaflet в Next.js
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type AddressMapProps = {
  onAddressSelect: (data: { city: string; address: string }) => void;
};

// Внутренний компонент для обработки кликов
function MapClickHandler({ onAddressFound }: { onAddressFound: (lat: number, lng: number, data: any) => void }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      try {
        // Используем бесплатный API OpenStreetMap (Nominatim)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=ru`
        );
        const data = await response.json();
        onAddressFound(lat, lng, data);
      } catch (error) {
        console.error('Ошибка геокодирования:', error);
        alert('Не удалось определить адрес. Попробуйте еще раз.');
      }
    },
  });
  return null;
}

export default function AddressMap({ onAddressSelect }: AddressMapProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  const handleAddressFound = (lat: number, lng: number, data: any) => {
    setPosition([lat, lng]);
    
    const addr = data.address || {};
    
    // Пытаемся умно собрать город и улицу
    const city = addr.city || addr.town || addr.village || addr.hamlet || '';
    const street = addr.road || addr.pedestrian || addr.highway || '';
    const house = addr.house_number || '';
    
    // Формируем строку адреса
    let fullAddress = street;
    if (house) fullAddress += `, д. ${house}`;

    onAddressSelect({
      city,
      address: fullAddress.trim().replace(/^,\s*/, '') // убираем запятую в начале, если улицы нет
    });
  };

  return (
    <div className="h-[300px] w-full rounded-xl overflow-hidden border border-gray-200 z-0 relative">
      <MapContainer 
        center={[51.8167, 68.35]} //корды города
        zoom={10} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onAddressFound={handleAddressFound} />
        {position && <Marker position={position} icon={icon} />}
      </MapContainer>
      
      <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur text-xs p-2 rounded-lg z-[1000] text-center text-gray-500 shadow-sm pointer-events-none">
        Нажмите на карту, чтобы выбрать адрес
      </div>
    </div>
  );
}