import data from '../data/faskes.json';

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
  status: 'Tercukupi' | 'Perlu Pembangunan';
  rasio: number;
  lat: number;
  lng: number;
}

// Koordinat perkiraan untuk center point kota/kabupaten di Jatim
const coordinates: Record<string, [number, number]> = {
  "Pacitan": [-8.1953, 111.1068], "Ponorogo": [-7.8687, 111.4646], "Trenggalek": [-8.0827, 111.7107],
  "Tulungagung": [-8.0645, 111.9023], "Blitar": [-8.1360, 112.2222], "Kediri": [-7.8286, 112.0119],
  "Malang": [-8.1500, 112.5833], "Lumajang": [-8.1333, 113.2167], "Jember": [-8.1691, 113.7024],
  "Banyuwangi": [-8.2192, 114.3692], "Bondowoso": [-7.9157, 113.8219], "Situbondo": [-7.7058, 114.0044],
  "Probolinggo": [-7.8540, 113.2847], "Pasuruan": [-7.6453, 112.9075], "Sidoarjo": [-7.4478, 112.7183],
  "Mojokerto": [-7.5501, 112.4410], "Jombang": [-7.5458, 112.2333], "Nganjuk": [-7.6046, 111.9015],
  "Madiun": [-7.6108, 111.6425], "Magetan": [-7.6534, 111.3323], "Ngawi": [-7.4042, 111.4423],
  "Bojonegoro": [-7.1500, 111.8833], "Tuban": [-6.8964, 112.0625], "Lamongan": [-7.1186, 112.3168],
  "Gresik": [-7.1553, 112.6550], "Bangkalan": [-7.0264, 112.7445], "Sampang": [-7.1953, 113.2458],
  "Pamekasan": [-7.1592, 113.4775], "Sumenep": [-7.0167, 113.8667], "Kota Kediri": [-7.8167, 112.0167],
  "Kota Blitar": [-8.0983, 112.1681], "Kota Malang": [-7.9839, 112.6214], "Kota Probolinggo": [-7.7471, 113.2154],
  "Kota Pasuruan": [-7.6453, 112.9075], "Kota Mojokerto": [-7.4682, 112.4334], "Kota Madiun": [-7.6298, 111.5239],
  "Kota Surabaya": [-7.2504, 112.7688], "Kota Batu": [-7.8671, 112.5239]
};

export const getProcessedData = (): FaskesData[] => {
  return data.map((item: any) => {
    // Bersihkan format string angka ke integer
    const pendudukStr = item["Penduduk (ribu)"].replace(/,/g, '');
    const penduduk = parseInt(pendudukStr, 10);
    const totalFaskes = parseInt(item["Total Faskes"].replace(/,/g, ''), 10);
    
    // Perhitungan Rasio Faskes per 1000 penduduk
    const rasio = (totalFaskes / penduduk) * 1000;
    
    // Asumsi standar WHO / Kemenkes: 1 faskes (gabungan rs+klinik+posyandu) per 1000 penduduk
    const status = rasio >= 1 ? 'Tercukupi' : 'Perlu Pembangunan';
    
    const coord = coordinates[item["Kabupaten/Kota"]] || [-7.2504, 112.7688]; // Default Surabaya jika tidak ketemu

    return {
      id: item["_mb_row_id"],
      kabupatenKota: item["Kabupaten/Kota"],
      rsUmum: parseInt(item["Rumah Sakit Umum"]),
      rsKhusus: parseInt(item["Rumah Sakit Khusus"]),
      puskesmasRawatInap: parseInt(item["Puskesmas Rawat Inap"]),
      puskesmasNonRawatInap: parseInt(item["Puskesmas Non Rawat Inap"]),
      klinikPratama: parseInt(item["Klinik Pratama"]),
      posyandu: parseInt(item["Posyandu"].replace(/,/g, '')),
      totalFaskes,
      penduduk,
      kabupatenKotaBersih: item["kabupaten / kota bersih"],
      status,
      rasio,
      lat: coord[0],
      lng: coord[1]
    };
  });
};