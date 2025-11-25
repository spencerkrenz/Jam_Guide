"use client";

import dynamic from "next/dynamic";
import type { Jam } from "./MapView";

const MapView = dynamic(() => import("./MapView"), {
    ssr: false,
    loading: () => (
        <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
            Loading map...
        </div>
    ),
});

export default function MapWrapper({ jams }: { jams: Jam[] }) {
    return <MapView jams={jams} />;
}
