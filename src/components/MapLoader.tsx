"use client";

import dynamic from "next/dynamic";
import { FaskesData } from "@/lib/utils";

const MapInteractive = dynamic(() => import("./MapInteractive"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400">
      Menyiapkan Peta Interaktif...
    </div>
  ),
});

export default function MapLoader({ data }: { data?: FaskesData[] }) {
  return <MapInteractive data={data} />;
}
