"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, GeoJSON } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getProcessedData, FaskesData } from "@/lib/utils";

const JAWA_TIMUR_GEOJSON_URL = "/jawatimur.json";

// Helper khusus untuk membedakan Kabupaten dan Kota dari GeoJSON
const getRegionName = (feature: any) => {
  const name = feature.properties.NAME_2;
  const type = feature.properties.TYPE_2; // Biasanya berisi "Kabupaten" atau "Kota"
  const engType = feature.properties.ENGTYPE_2; // Cadangan jika TYPE_2 kosong

  const isKota = type === "Kota" || type === "Kotamadya" || engType === "City";

  if (isKota) {
    // Jika tipenya Kota tapi namanya belum ada embel-embel "Kota", kita tambahkan
    return name.toLowerCase().startsWith("kota") ? name : `Kota ${name}`;
  }

  // Jika Kabupaten, kembalikan nama aslinya (misal: "Kediri", "Malang")
  return name;
};

export default function MapInteractive({ data }: { data?: FaskesData[] }) {
  const [isMounted, setIsMounted] = useState(false);
  const [geoJsonData, setGeoJsonData] =
    useState<GeoJSON.FeatureCollection | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const faskesData = useMemo(() => data ?? getProcessedData(), [data]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    let cancelled = false;

    fetch(JAWA_TIMUR_GEOJSON_URL)
      .then(async (res) => {
        if (!res.ok) throw new Error("Gagal load file geojson lokal");
        return res.json();
      })
      .then((geoJson) => {
        geoJson.features.sort((a: any, b: any) => {
          const isKotaA =
            a.properties.TYPE_2 === "Kota" || a.properties.ENGTYPE_2 === "City";
          const isKotaB =
            b.properties.TYPE_2 === "Kota" || b.properties.ENGTYPE_2 === "City";
          if (isKotaA && !isKotaB) return 1;
          if (!isKotaA && isKotaB) return -1;
          return 0;
        });

        if (!cancelled) setGeoJsonData(geoJson);
      })
      .catch((error) => console.error("Error fetching GeoJSON:", error));

    return () => {
      cancelled = true;
    };
  }, [isMounted]);

  useEffect(() => {
    if (!mapReady || !geoJsonData || !mapRef.current) return;

    const mapInstance = mapRef.current;
    const coords: [number, number][] = [];
    const processCoords = (c: any) => {
      if (
        Array.isArray(c) &&
        typeof c[0] === "number" &&
        typeof c[1] === "number"
      ) {
        coords.push([c[1], c[0]]);
      } else if (Array.isArray(c)) {
        c.forEach(processCoords);
      }
    };

    geoJsonData.features.forEach((feature) => {
      const g: any = feature.geometry;
      if (g?.coordinates) processCoords(g.coordinates);
    });

    if (coords.length === 0) return;

    const bounds = L.latLngBounds(coords);
    if (!bounds.isValid()) return;

    const fitMap = () => {
      if (!mapInstance || !mapInstance.getContainer()) return;
      try {
        mapInstance.invalidateSize();
        mapInstance.fitBounds(bounds, { padding: [20, 20] });
      } catch (error) {
        console.error("Error fitting bounds:", error);
      }
    };

    mapInstance.whenReady(fitMap);
  }, [geoJsonData, mapReady]);

  const getColor = (rasio: number) => {
    return rasio >= 1.5
      ? "#10b981"
      : rasio >= 1.0
        ? "#34d399"
        : rasio >= 0.8
          ? "#fbbf24"
          : rasio >= 0.5
            ? "#f87171"
            : "#ef4444";
  };

  const geoJsonStyle = (feature: any) => {
    const regionName = getRegionName(feature);

    // PENTING: Mencocokkan dengan properti kabupatenKota (bukan kabupatenKotaBersih)
    const data = faskesData.find((d) => d.kabupatenKota === regionName);

    const rasio = data ? data.rasio : 0;

    return {
      fillColor: getColor(rasio),
      weight: 1.5,
      opacity: 1,
      color: "#ffffff",
      dashArray: "3",
      fillOpacity: 0.85,
    };
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const regionName = getRegionName(feature);
    const data = faskesData.find((d) => d.kabupatenKota === regionName);

    if (data) {
      const tooltipContent = `
        <div class="text-left font-sans">
          <strong class="block text-slate-900 mb-1">${data.kabupatenKota}</strong>
          <div class="text-[11px] text-slate-500 uppercase tracking-[0.12em] mb-1">
            Rasio Kapasitas
          </div>
          <div class="text-lg font-bold ${data.rasio >= 1 ? "text-emerald-600" : "text-rose-500"}">
            ${data.rasio.toFixed(2)}
          </div>
          <span class="inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            data.status === "Tercukupi"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-rose-100 text-rose-700"
          }">
            ${data.status}
          </span>
          
          ${
            data.rekomendasi
              ? `
            <div class="mt-2 text-[11px] text-slate-600">
              <span class="font-semibold">Rekomendasi:</span><br />
              ${data.rekomendasi}
            </div>
          `
              : ""
          }
        </div>
      `;
      try {
        layer.bindTooltip(tooltipContent, {
          sticky: true,
          className: "leaflet-tooltip-custom",
          opacity: 0.95,
        });
      } catch (error) {
        console.error("Tooltip binding failed:", error);
      }

      layer.on({
        mouseover: (e) => {
          const target = e.target;
          target.setStyle({ weight: 3, color: "#1e293b", fillOpacity: 1 });
          target.bringToFront();
        },
        mouseout: (e) => {
          e.target.setStyle(geoJsonStyle(feature));
        },
      });
    }
  };

  if (!isMounted) {
    return (
      <div className="h-full w-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400">
        Menyiapkan Peta Interaktif...
      </div>
    );
  }

  return (
    <MapContainer
      center={[-7.6, 112.7]}
      zoom={8}
      zoomControl={false}
      ref={mapRef}
      whenReady={() => setMapReady(true)}
      style={{
        height: "100%",
        width: "100%",
        borderRadius: "0.75rem",
        zIndex: 0,
        backgroundColor: "#020617",
      }}
    >
      {mapReady && geoJsonData && (
        <GeoJSON
          data={geoJsonData}
          style={geoJsonStyle}
          onEachFeature={onEachFeature}
        />
      )}
    </MapContainer>
  );
}
