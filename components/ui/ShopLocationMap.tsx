'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Фикс иконок
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function ShopLocationMap({ city, address }: { city: string; address: string }) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    async function getCoordinates() {
      if (!city && !address) return;
      
      const query = `${city}, ${address}`;
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
        );
        const data = await response.json();
        if (data && data.length > 0) {
          setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        }
      } catch (error) {
        console.error('Не удалось найти координаты', error);
      }
    }
    getCoordinates();
  }, [city, address]);

  if (!position) return null;

  return (
    <div className="h-64 w-full rounded-xl overflow-hidden border border-gray-200 z-0 relative mt-4">
      <MapContainer 
        center={position} 
        zoom={14} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false} // Чтобы не мешало скроллить страницу
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={icon}>
          <Popup>{city}, {address}</Popup>
        </Marker>
      </MapContainer>
      <a 
        href={`https://www.google.com/maps/search/?api=1&query=${position[0]},${position[1]}`}
        target="_blank"
        className="absolute bottom-2 right-2 bg-white px-3 py-1 rounded-lg text-xs font-bold shadow-md z-[1000] text-blue-600 hover:bg-gray-50"
      >
        Открыть в Навигаторе
      </a>
    </div>
  );
}