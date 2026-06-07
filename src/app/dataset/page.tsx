"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getProcessedData } from "@/lib/utils";
import { ArrowLeft, Search } from "lucide-react";

export default function DatasetPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const data = useMemo(() => {
    return getProcessedData().sort((a, b) => {
      const aKey = a.kabupatenKota.toLowerCase();
      const bKey = b.kabupatenKota.toLowerCase();
      if (aKey === bKey) return a.id.localeCompare(b.id);
      return aKey < bKey ? -1 : 1;
    });
  }, []);

  const filteredData = useMemo(
    () =>
      data.filter((d) =>
        d.kabupatenKota.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [data, searchTerm],
  );

  const totalPopulasi = data.reduce((acc, curr) => acc + curr.penduduk, 0);
  const totalFaskes = data.reduce((acc, curr) => acc + curr.totalFaskes, 0);
  const daerahKurang = data.filter(
    (d) => d.status === "Perlu Pembangunan",
  ).length;
  const daerahCukup = data.filter((d) => d.status === "Tercukupi").length;

  return (
    <main className="min-h-screen bg-slate-950 py-8 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="rounded-[1.75rem] border border-slate-800 bg-slate-900/95 p-6 shadow-[0_40px_80px_-40px_rgba(56,189,248,0.35)] ring-1 ring-sky-400/10 backdrop-blur-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-300/80">
                Data Provinsi
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-100 sm:text-5xl">
                Detail Dataset Provinsi
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
                Lihat tabel lengkap kabupaten/kota, status fasilitas kesehatan,
                dan rekomendasi pembangunan secara detail.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-400/20 bg-slate-900/80 px-4 py-2 text-sm font-medium text-sky-300 transition hover:bg-slate-800/80"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Dashboard
            </Link>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_0.75fr]">
          <div className="overflow-hidden rounded-[1.75rem] border border-slate-800 bg-slate-900/95 shadow-2xl shadow-slate-950/40">
            <div className="border-b border-slate-800 bg-slate-950/90 px-6 py-5">
              <h2 className="text-lg font-semibold text-slate-100">
                Filter Dataset
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Cari kabupaten/kota untuk menampilkan baris data relevan secara
                instan.
              </p>
            </div>
            <div className="px-6 py-5">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari Kabupaten/Kota..."
                    className="w-full rounded-xl border-0 bg-slate-950/80 py-2.5 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-sky-500/20"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto p-6">
              <div className="min-w-[980px] max-h-[620px] overflow-y-auto rounded-3xl border border-slate-800 bg-slate-950/90">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-xs font-semibold">
                    <tr>
                      <th className="px-6 py-4">Kabupaten/Kota</th>
                      <th className="px-6 py-4 text-right">RS Umum</th>
                      <th className="px-6 py-4 text-right">Puskesmas</th>
                      <th className="px-6 py-4 text-right">Total Faskes</th>
                      <th className="px-6 py-4 text-right">Populasi</th>
                      <th className="px-6 py-4 text-center">Rasio / 1k</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Rekomendasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-slate-800 hover:bg-slate-900/80 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-slate-100">
                          {row.kabupatenKota}
                        </td>
                        <td className="px-6 py-4 text-right text-slate-300">
                          {row.rsUmum}
                        </td>
                        <td className="px-6 py-4 text-right text-slate-300">
                          {row.puskesmasRawatInap + row.puskesmasNonRawatInap}
                        </td>
                        <td className="px-6 py-4 text-right text-slate-300">
                          {row.totalFaskes.toLocaleString("id-ID")}
                        </td>
                        <td className="px-6 py-4 text-right text-slate-300">
                          {row.penduduk.toLocaleString("id-ID")}
                        </td>
                        <td className="px-6 py-4 text-center font-mono text-slate-100">
                          {row.rasio.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                              row.status === "Tercukupi"
                                ? "bg-emerald-100/10 text-emerald-300 ring-emerald-300/20"
                                : "bg-rose-100/10 text-rose-300 ring-rose-300/20"
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-300">
                          {row.rekomendasi ? (
                            <span className="inline-flex rounded-full bg-sky-500/10 px-3 py-1 leading-tight text-sky-200 ring-1 ring-sky-500/20">
                              {row.rekomendasi}
                            </span>
                          ) : (
                            <span className="text-slate-500">Tidak perlu</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <aside className="overflow-hidden rounded-[1.75rem] border border-slate-800 bg-slate-900/95 p-6 shadow-2xl shadow-slate-950/40">
            <h2 className="text-lg font-semibold text-slate-100">
              Ringkasan Cepat
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Statistik singkat membantu Anda memahami distribusi faskes dan
              fokus wilayah bermasalah.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-4">
              <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
                <p className="text-sm text-slate-400">Total Faskes</p>
                <p className="mt-2 text-2xl font-semibold text-slate-100">
                  {totalFaskes.toLocaleString("id-ID")}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
                <p className="text-sm text-slate-400">Total Populasi</p>
                <p className="mt-2 text-2xl font-semibold text-slate-100">
                  {totalPopulasi.toLocaleString("id-ID")}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
                <p className="text-sm text-slate-400">Daerah Tercukupi</p>
                <p className="mt-2 text-2xl font-semibold text-slate-100">
                  {daerahCukup}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
                <p className="text-sm text-slate-400">Perlu Pembangunan</p>
                <p className="mt-2 text-2xl font-semibold text-slate-100">
                  {daerahKurang}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
