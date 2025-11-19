"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";

// Relax types so TS doesn't complain about props on these components
const AnyMapContainer = MapContainer as any;
const AnyTileLayer = TileLayer as any;
const AnyCircleMarker = CircleMarker as any;
const AnyPopup = Popup as any;

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

export default function MapView({ jams }: { jams: Jam[] }) {
  const points = (jams || []).filter(
    (jam) => jam.latitude !== null && jam.longitude !== null
  );

  // Default to SF Bay if nothing has coords yet
  const defaultCenter: [number, number] = [37.7749, -122.4194];

  const center: [number, number] =
    points.length > 0
      ? [points[0].latitude as number, points[0].longitude as number]
      : defaultCenter;

  return (
    <div className="mb-6 h-[420px] w-full overflow-hidden rounded-md border border-slate-800">
      <AnyMapContainer
        center={center}
        zoom={8}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <AnyTileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {points.map((jam) => (
          <AnyCircleMarker
            key={jam.id}
            center={[jam.latitude as number, jam.longitude as number]}
            radius={6}
          >
            <AnyPopup>
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
            </AnyPopup>
          </AnyCircleMarker>
        ))}
      </AnyMapContainer>
    </div>
  );
}
