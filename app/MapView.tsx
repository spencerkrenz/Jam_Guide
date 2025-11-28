"use client";

import { MapContainer, TileLayer, CircleMarker, Popup, ZoomControl } from "react-leaflet";
import Link from "next/link";

export type Jam = {
  id: number | null;
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
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          className="saturate-[5] contrast-[1.2] hue-rotate-[-15deg]"
        />

        {points.map((jam, idx) => {
          const hasValidId =
            typeof jam.id === "number" && Number.isFinite(jam.id);
          const markerKey = hasValidId ? jam.id! : idx;

          return (
            <CircleMarker
              key={markerKey}
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

                  {hasValidId && (
                    <div className="mt-2">
                      <Link
                        href={`/jam/${jam.id}`}
                        className="text-xs text-blue-500 hover:underline"
                      >
                        View details
                      </Link>
                    </div>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
