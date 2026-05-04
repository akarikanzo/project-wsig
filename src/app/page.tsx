'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { getProcessedData } from '@/lib/utils';
import { Activity, Users, AlertTriangle, CheckCircle } from 'lucide-react';

// Matikan SSR untuk komponen peta Leaflet
const MapComponent = dynamic(() => import('@/components/MapInteractive'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400">Memuat Peta Interaktif...</div>
});

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const data = useMemo(() => getProcessedData(), []);

  // Filter data berdasarkan pencarian
  const filteredData = data.filter(d => 
    d.kabupatenKota.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Metrik Summary
  const totalPopulasi = data.reduce((acc, curr) => acc + curr.penduduk, 0);
  const totalFaskes = data.reduce((acc, curr) => acc + curr.totalFaskes, 0);
  const daerahKurang = data.filter(d => d.status === 'Perlu Pembangunan').length;
  const daerahCukup = data.filter(d => d.status === 'Tercukupi').length;

  return (
    <main className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard Distribusi Faskes Jawa Timur</h1>
          <p className="text-slate-500 mt-1">Analisis kecukupan fasilitas kesehatan berdasarkan komparasi populasi wilayah.</p>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card title="Total Faskes" value={totalFaskes.toLocaleString('id-ID')} icon={<Activity className="text-blue-500" />} />
          <Card title="Total Populasi" value={totalPopulasi.toLocaleString('id-ID')} icon={<Users className="text-indigo-500" />} />
          <Card title="Daerah Cukup Faskes" value={daerahCukup.toString()} icon={<CheckCircle className="text-emerald-500" />} />
          <Card title="Perlu Pembangunan" value={daerahKurang.toString()} icon={<AlertTriangle className="text-red-500" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Interactive Map Area (Takes 2/3 width on large screens) */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-4 relative z-0">
             <h2 className="text-lg font-semibold mb-4">Peta Persebaran & Status Kecukupan</h2>
             <div className="h-[500px] w-full relative rounded-xl overflow-hidden border border-slate-100">
                <MapComponent data={filteredData} />
             </div>
          </div>

          {/* Side Panel Analysis */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 overflow-y-auto">
             <h2 className="text-lg font-semibold mb-4">Rekomendasi Kebijakan</h2>
             <div className="space-y-4">
               {data
                  .sort((a, b) => a.rasio - b.rasio)
                  .slice(0, 8)
                  .map(daerah => (
                 <div key={daerah.id} className="p-3 bg-red-50 border border-red-100 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-slate-800">{daerah.kabupatenKota}</span>
                      <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-medium">Prioritas</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Rasio sangat rendah: <b>{daerah.rasio.toFixed(2)}</b>. Dengan {daerah.penduduk.toLocaleString('id-ID')} penduduk, wilayah ini butuh penambahan puskesmas/klinik.
                    </p>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Dataset Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Detail Dataset Provinsi</h2>
            <input 
              type="text" 
              placeholder="Cari Kabupaten/Kota..." 
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase border-y border-slate-200">
                <tr>
                  <th className="px-4 py-3">Kabupaten/Kota</th>
                  <th className="px-4 py-3 text-right">RS Umum</th>
                  <th className="px-4 py-3 text-right">Puskesmas</th>
                  <th className="px-4 py-3 text-right">Total Faskes</th>
                  <th className="px-4 py-3 text-right">Populasi</th>
                  <th className="px-4 py-3 text-center">Rasio / 1k</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{row.kabupatenKota}</td>
                    <td className="px-4 py-3 text-right">{row.rsUmum}</td>
                    <td className="px-4 py-3 text-right">{row.puskesmasRawatInap + row.puskesmasNonRawatInap}</td>
                    <td className="px-4 py-3 text-right">{row.totalFaskes.toLocaleString('id-ID')}</td>
                    <td className="px-4 py-3 text-right">{row.penduduk.toLocaleString('id-ID')}</td>
                    <td className="px-4 py-3 text-center font-mono">{row.rasio.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        row.status === 'Tercukupi' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}

// Sub-component untuk Card Metrik
function Card({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
      <div className="p-3 bg-slate-50 rounded-lg">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}