import Link from "next/link";
import { getProcessedData } from "@/lib/utils";
import { Activity, Users, AlertTriangle, CheckCircle } from "lucide-react";
import MapComponent from "@/components/MapLoader";

export default function Dashboard() {
  const data = getProcessedData().sort((a, b) => {
    const aKey = a.kabupatenKota.toLowerCase();
    const bKey = b.kabupatenKota.toLowerCase();
    if (aKey === bKey) return a.id.localeCompare(b.id);
    return aKey < bKey ? -1 : 1;
  });

  const sortedByRasio = [...data].sort((a, b) => a.rasio - b.rasio);

  const filteredData = data;

  // Metrik Summary
  const totalPopulasi = data.reduce((acc, curr) => acc + curr.penduduk, 0);
  const totalFaskes = data.reduce((acc, curr) => acc + curr.totalFaskes, 0);
  const daerahKurang = data.filter(
    (d) => d.status === "Perlu Pembangunan",
  ).length;
  const daerahCukup = data.filter((d) => d.status === "Tercukupi").length;

  return (
    <main className="min-h-screen bg-slate-950 py-8 font-sans text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="rounded-[1.75rem] border border-slate-800 bg-slate-900/95 p-6 shadow-[0_40px_80px_-40px_rgba(56,189,248,0.35)] ring-1 ring-sky-400/10 backdrop-blur-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-300/80">
                Dashboard Fasilitas Kesehatan
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-100 sm:text-5xl">
                Distribusi Faskes Jawa Timur
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
                Peta interaktif dan rekomendasi kebijakan untuk meningkatkan
                kecukupan layanan kesehatan di Jawa Timur.
              </p>
            </div>
            <Link
              href="/dataset"
              className="inline-flex items-center justify-center rounded-2xl border border-sky-400/20 bg-slate-900/80 px-4 py-2 text-sm font-medium text-sky-300 transition hover:bg-slate-800/80"
            >
              Detail Dataset
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-6">
            <Card
              title="Total Faskes"
              value={totalFaskes.toLocaleString("id-ID")}
              icon={<Activity className="text-sky-400" />}
            />
            <Card
              title="Total Populasi"
              value={totalPopulasi.toLocaleString("id-ID")}
              icon={<Users className="text-cyan-400" />}
            />
            <Card
              title="Daerah Tercukupi"
              value={daerahCukup.toString()}
              icon={<CheckCircle className="text-emerald-400" />}
            />
            <Card
              title="Perlu Pembangunan"
              value={daerahKurang.toString()}
              icon={<AlertTriangle className="text-rose-400" />}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.8fr_0.95fr] overflow-hidden">
        <div className="space-y-6 overflow-hidden">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-800 bg-slate-950/95 shadow-2xl shadow-slate-950/50 ring-1 ring-slate-800/40">
            <div className="border-b border-slate-800 bg-slate-950/90 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">
                  Peta Persebaran & Status Kecukupan
                </h2>
                <p className="text-sm text-slate-400">
                  Klik wilayah untuk melihat rekomendasi pembangunan faskes.
                </p>
              </div>
            </div>
            <div className="relative h-[620px] overflow-hidden rounded-b-[1.75rem] bg-slate-950">
              <MapComponent data={filteredData} />
              <div className="absolute left-4 top-4 z-20 rounded-3xl border border-slate-800 bg-slate-950/95 p-4 shadow-2xl shadow-slate-950/30 text-slate-100 w-[280px] backdrop-blur-md">
                <p className="text-sm font-semibold text-slate-100">
                  Pembobotan Faskes
                </p>
                <div className="mt-3 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-400" />
                    <span>RS Umum: 250</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-sky-400/80" />
                    <span>RS Khusus: 100</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-amber-400/90" />
                    <span>Puskesmas Rawat Inap: 30</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-slate-400/90" />
                    <span>Puskesmas Non Inap: 10</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-violet-400/90" />
                    <span>Klinik Pratama: 5</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-rose-400/90" />
                    <span>Posyandu: 1</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="flex min-h-[620px] max-h-[calc(100vh-10rem)] flex-col overflow-hidden rounded-[1.75rem] border border-slate-800 bg-slate-900/95 shadow-2xl shadow-slate-950/40">
          <div className="border-b border-slate-800 bg-slate-950/90 px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-100">
              Rekomendasi Kebijakan
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Gulir secara terpisah untuk fokus pada prioritas wilayah dengan
              rasio terendah.
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            <div className="space-y-4">
              {sortedByRasio.slice(0, 8).map((daerah) => (
                <div
                  key={daerah.id}
                  className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5 shadow-[0_12px_30px_-18px_rgba(15,23,42,0.8)]"
                >
                  <div className="flex items-center justify-between gap-3 text-slate-100">
                    <span className="text-sm font-semibold">
                      {daerah.kabupatenKota}
                    </span>
                    <span className="rounded-full bg-rose-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-300 ring-1 ring-rose-500/20">
                      Prioritas
                    </span>
                  </div>
                  <div className="mt-3 text-sm text-slate-400">
                    Rasio:{" "}
                    <span className="font-semibold text-slate-100">
                      {daerah.rasio.toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
                    <span className="rounded-full bg-slate-950/90 px-3 py-1 ring-1 ring-slate-800">
                      Populasi {daerah.penduduk.toLocaleString("id-ID")}
                    </span>
                    <span className="rounded-full bg-slate-950/90 px-3 py-1 ring-1 ring-slate-800">
                      {daerah.rekomendasi || "Rekomendasi tersedia"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

// Sub-component untuk Card Metrik
function Card({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-slate-900/95 p-6 rounded-2xl shadow-[0_20px_60px_-40px_rgba(15,23,42,0.8)] border border-slate-800 flex min-h-[140px] items-center gap-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-slate-100">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <p className="mt-2 text-2xl font-semibold text-slate-100">{value}</p>
      </div>
    </div>
  );
}
