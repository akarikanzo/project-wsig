'use client';

import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { FaskesData } from '../lib/utils';

export default function MapInteractive({ data }: { data: FaskesData[] }) {
  return (
    <MapContainer 
      center={[-7.6, 112.7]} 
      zoom={8} 
      style={{ height: '100%', width: '100%', borderRadius: '0.75rem', zIndex: 0 }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      
      {data.map((daerah) => (
        <CircleMarker
          key={daerah.id}
          center={[daerah.lat, daerah.lng]}
          radius={Math.max(daerah.totalFaskes / 100, 8)} // Ukuran radius dinamis berdasarkan jumlah faskes
          pathOptions={{
            color: daerah.status === 'Tercukupi' ? '#10b981' : '#ef4444', // Hijau jika cukup, Merah jika kurang
            fillColor: daerah.status === 'Tercukupi' ? '#34d399' : '#f87171',
            fillOpacity: 0.6,
          }}
        >
          <Popup>
            <div className="font-sans">
              <h3 className="font-bold text-lg">{daerah.kabupatenKota}</h3>
              <div className="mt-2 text-sm space-y-1">
                <p><strong>Total Faskes:</strong> {daerah.totalFaskes.toLocaleString('id-ID')}</p>
                <p><strong>Penduduk:</strong> {daerah.penduduk.toLocaleString('id-ID')}</p>
                <p><strong>Rasio:</strong> {daerah.rasio.toFixed(2)} faskes/1000 jiwa</p>
                <div className={`mt-2 inline-block px-2 py-1 rounded text-white font-semibold ${
                  daerah.status === 'Tercukupi' ? 'bg-emerald-500' : 'bg-red-500'
                }`}>
                  {daerah.status}
                </div>
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}