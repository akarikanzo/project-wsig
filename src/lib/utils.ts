import data from "../data/faskes.json";

export interface FaskesData {
  id: string;
  kabupatenKota: string;
  rsUmum: number;
  rsKhusus: number;
  puskesmasRawatInap: number;
  puskesmasNonRawatInap: number;
  klinikPratama: number;
  posyandu: number;
  totalFaskes: number;
  penduduk: number;
  kabupatenKotaBersih: string;
  status: "Tercukupi" | "Perlu Pembangunan";
  rasio: number;
  rekomendasi: string;
  lat: number;
  lng: number;
}

// Koordinat perkiraan untuk center point kota/kabupaten di Jatim
const coordinates: Record<string, [number, number]> = {
  Pacitan: [-8.1953, 111.1068],
  Ponorogo: [-7.8687, 111.4646],
  Trenggalek: [-8.0827, 111.7107],
  Tulungagung: [-8.0645, 111.9023],
  Blitar: [-8.136, 112.2222],
  Kediri: [-7.8286, 112.0119],
  Malang: [-8.15, 112.5833],
  Lumajang: [-8.1333, 113.2167],
  Jember: [-8.1721, 113.7],
  Banyuwangi: [-8.2192, 114.3692],
  Bondowoso: [-7.9135, 113.8214],
  Situbondo: [-7.7056, 114.0044],
  Probolinggo: [-7.7441, 113.2158],
  Pasuruan: [-7.6453, 112.9075],
  Sidoarjo: [-7.4478, 112.7183],
  Mojokerto: [-7.4682, 112.4334],
  Jombang: [-7.5469, 112.2335],
  Nganjuk: [-7.6044, 111.9023],
  Madiun: [-7.6298, 111.5239],
  Magetan: [-7.6493, 111.3284],
  Ngawi: [-7.4048, 111.4423],
  Bojonegoro: [-7.1502, 111.8818],
  Tuban: [-6.8953, 112.0649],
  Lamongan: [-7.1182, 112.3155],
  Gresik: [-7.1613, 112.6508],
  Bangkalan: [-7.027, 112.9348],
  Sampang: [-7.1895, 113.2458],
  Pamekasan: [-7.1585, 113.4805],
  Sumenep: [-7.0086, 113.8601],
  "Kota Kediri": [-7.8228, 112.0119],
  "Kota Blitar": [-8.0983, 112.1681],
  "Kota Malang": [-7.9797, 112.6304],
  "Kota Probolinggo": [-7.7554, 113.2158],
  "Kota Pasuruan": [-7.6453, 112.9075],
  "Kota Mojokerto": [-7.4682, 112.4334],
  "Kota Madiun": [-7.6298, 111.5239],
  "Kota Surabaya": [-7.2504, 112.7688],
  "Kota Batu": [-7.8671, 112.5239],
};

export const getProcessedData = (): FaskesData[] => {
  return data.map((item: any) => {
    // 1. Helper function untuk membersihkan koma sebelum di-parse ke angka
    const parseNumber = (val: string | undefined) => {
      if (!val) return 0;
      return parseInt(val.toString().replace(/[,.]/g, ""), 10);
    };

    // 2. Parsing Data Mentah
    let penduduk = parseNumber(item["Penduduk (ribu)"]);
    if (penduduk > 0 && penduduk < 10000) {
      penduduk = penduduk * 1000;
    }

    const totalFaskes = parseNumber(item["Total Faskes"]);

    const rsUmum = parseNumber(item["Rumah Sakit Umum"]);
    const rsKhusus = parseNumber(item["Rumah Sakit Khusus"]);
    const puskesmasRawatInap = parseNumber(item["Puskesmas Rawat Inap"]);
    const puskesmasNonRawatInap = parseNumber(item["Puskesmas Non Rawat Inap"]);
    const klinikPratama = parseNumber(item["Klinik Pratama"]);
    const posyandu = parseNumber(item["Posyandu"]);

    // 3. Hitung Kapasitas Medis dengan Bobot yang Lebih Realistis
    // RS dinaikkan jadi 250 (rata-rata bed RSUD tingkat kabupaten)
    const kapasitasMedis =
      rsUmum * 250 +
      rsKhusus * 100 +
      puskesmasRawatInap * 30 +
      puskesmasNonRawatInap * 10 +
      klinikPratama * 5 +
      posyandu * 1;

    // 4. Hitung Skor Mentah per 10.000 Penduduk
    const skorKapasitasMentah = (kapasitasMedis / penduduk) * 10000;

    // 5. Kalibrasi Ambang Batas (Benchmarking)
    // Rata-rata kapasitas di Jatim berkisar di angka 30-40.
    // Kita turunkan target standar aman menjadi 35 agar distribusinya terlihat.
    const rasio = skorKapasitasMentah / 35;

    const status = rasio >= 1 ? "Tercukupi" : "Perlu Pembangunan";

    const targetKapasitas = (35 * penduduk) / 10000;
    let defisit = Math.ceil(targetKapasitas - kapasitasMedis);
    let rekomendasiTeks = "";

    if (defisit > 0) {
      const saran: string[] = [];

      const butuhRS = Math.floor(defisit / 250);
      if (butuhRS > 0) saran.push(`${butuhRS} Rumah Sakit Umum`);
      defisit %= 250;

      const butuhPuskesmasInap = Math.floor(defisit / 30);
      if (butuhPuskesmasInap > 0)
        saran.push(`${butuhPuskesmasInap} Puskesmas Rawat Inap`);
      defisit %= 30;

      const butuhPuskesmasNon = Math.floor(defisit / 10);
      if (butuhPuskesmasNon > 0)
        saran.push(`${butuhPuskesmasNon} Puskesmas Non Inap`);
      defisit %= 10;

      const butuhKlinik = Math.floor(defisit / 5);
      if (butuhKlinik > 0) saran.push(`${butuhKlinik} Klinik`);
      defisit %= 5;

      if (defisit > 0) saran.push(`${defisit} Posyandu`);

      rekomendasiTeks = saran.join(", ");
    }

    const coord = coordinates[item["Kabupaten/Kota"]] || [-7.2504, 112.7688];

    return {
      id: item["_mb_row_id"],
      kabupatenKota: item["Kabupaten/Kota"],
      rsUmum,
      rsKhusus,
      puskesmasRawatInap,
      puskesmasNonRawatInap,
      klinikPratama,
      posyandu,
      totalFaskes,
      penduduk,
      kabupatenKotaBersih: item["kabupaten / kota bersih"],
      status,
      rasio,
      rekomendasi: rekomendasiTeks,
      lat: coord[0],
      lng: coord[1],
    };
  });
};
