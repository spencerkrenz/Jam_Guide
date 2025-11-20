"use client";

import { useEffect, useState } from "react";

type Jam = {
  id: number;
  latitude: number | null;
  longitude: number | null;
  event_name: string | null;
  city: string | null;
  region: string | null;
  venue_name: string | null;
  primary_genre: string | null;
  skill_level: string | null;
  event_kind: string | null;
};

type LeafletComponents = {
  MapContainer: any;
  TileLayer: any;
  CircleMarker: any;
  Popup: any;
};

export default function MapView({ jams }: { jams: Jam[] }) {
  const [leaflet, setLeaflet] = useState<LeafletComponents | null>(null);

  // Only load react-leaflet on the client
  useEffect(() => {
    let mounted = true;

    async function loadLeaflet() {
      const L = await import("react-leaflet");
      if (!mounted) return;

      setLeaflet({
        MapContainer: L.MapContainer,
        TileLayer: L.TileLayer,
        CircleMarker: L.CircleMarker,
        Popup: L.Popup,
      });
    }

    loadLeaflet();

    return () => {
      mounted = false;
    };
  }, []);

  // While loading the map lib, keep layout stable
  if (!leaflet) {
    return (
      <div className="h-full w-full flex items-center justify-center text-sm text-slate-400">
        Loading map…
      </div>
    );
  }

  const { MapContainer, TileLayer, CircleMarker, Popup } = leaflet;

  const points = (jams || []).filter(
    (jam) => jam.latitude !== null && jam.longitude !== null
  );

  const defaultCenter: [number, number] = [37.7749, -122.4194];

  const center: [number, number] =
    points.length > 0
      ? [points[0].latitude as number, points[0].longitude as number]
      : defaultCenter;

  return (
    <div className="h-full w-full">
      <MapContainer
        center={center}
        zoom={8}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {points.map((jam) => (
          <CircleMarker
            key={jam.id}
            center={[jam.latitude as number, jam.longitude as number]}
            radius={6}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">
                  {jam.event_name || "Untitled event"}
                </div>
                <div className="text-xs text-slate-600">
                  {[jam.venue_name, jam.city, jam.region]
                    .filter(Boolean)
                    .join(" • ")}
                </div>
                <div className="mt-1 text-xs">
                  {[jam.event_kind, jam.primary_genre, jam.skill_level]
                    .filter(Boolean)
                    .join(" • ")}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
