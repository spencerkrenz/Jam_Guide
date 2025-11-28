"use client";

import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet";
import L from "leaflet";
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

// Define colors for each genre
const GENRE_COLORS: Record<string, { start: string; end: string; label: string }> = {
  bluegrass: { start: "#60a5fa", end: "#2563eb", label: "Bluegrass" }, // Blue
  old_time: { start: "#fb923c", end: "#ea580c", label: "Old Time" }, // Orange
  jazz: { start: "#c084fc", end: "#9333ea", label: "Jazz" }, // Purple
  jam_band: { start: "#4ade80", end: "#16a34a", label: "Jam Band" }, // Green
  folk: { start: "#2dd4bf", end: "#0d9488", label: "Folk" }, // Teal
  country: { start: "#fbbf24", end: "#d97706", label: "Country" }, // Amber
  rock: { start: "#f87171", end: "#dc2626", label: "Rock" }, // Red
  blues: { start: "#818cf8", end: "#4f46e5", label: "Blues" }, // Indigo
  celtic: { start: "#34d399", end: "#059669", label: "Celtic" }, // Emerald
  funk: { start: "#f472b6", end: "#db2777", label: "Funk" }, // Pink
  // Fallback
  default: { start: "#94a3b8", end: "#475569", label: "Other" }, // Slate
};

function getGenreColor(genre: string | null) {
  const normalized = genre?.toLowerCase().replace(/ /g, "_") || "default";
  // Check for exact match or fallback
  if (GENRE_COLORS[normalized]) return GENRE_COLORS[normalized];

  // Try to find a partial match or map specific known variations
  if (normalized.includes("bluegrass")) return GENRE_COLORS.bluegrass;
  if (normalized.includes("jazz")) return GENRE_COLORS.jazz;
  if (normalized.includes("folk")) return GENRE_COLORS.folk;

  return GENRE_COLORS.default;
}

function createPinIcon(genre: string | null) {
  const color = getGenreColor(genre);
  const gradientId = `grad-${genre?.replace(/[^a-zA-Z0-9]/g, "") || "default"}`;

  const svg = `
    <svg width="28" height="40" viewBox="0 0 40 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${gradientId}" x1="0" y1="0" x2="40" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="${color.start}" />
          <stop offset="100%" stop-color="${color.end}" />
        </linearGradient>
        <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
          <feOffset dx="0" dy="2" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge> 
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/> 
          </feMerge>
        </filter>
      </defs>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M20 0C8.954 0 0 8.954 0 20C0 35 20 56 20 56C20 56 40 35 40 20C40 8.954 31.046 0 20 0ZM20 28C24.418 28 28 24.418 28 20C28 15.582 24.418 12 20 12C15.582 12 12 15.582 12 20C12 24.418 15.582 28 20 28Z" fill="url(#${gradientId})" filter="url(#dropShadow)"/>
    </svg>
  `;

  return L.divIcon({
    className: "custom-pin-icon bg-transparent border-none",
    html: svg,
    iconSize: [28, 40],
    iconAnchor: [14, 40],
    popupAnchor: [0, -40],
  });
}

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
    <div className="relative h-full w-full">
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
          const icon = createPinIcon(jam.primary_genre);

          return (
            <Marker
              key={markerKey}
              position={[jam.latitude as number, jam.longitude as number]}
              icon={icon}
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
            </Marker>
          );
        })}
      </MapContainer>

      {/* Genre Legend */}
      <div className="absolute bottom-6 left-4 z-[1000] rounded-lg border border-slate-700 bg-slate-900/90 p-3 shadow-xl backdrop-blur-sm max-h-[40vh] overflow-y-auto">
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          Genres
        </h3>
        <div className="space-y-2">
          {Object.entries(GENRE_COLORS).map(([key, color]) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full shadow-sm"
                style={{
                  background: `linear-gradient(to bottom, ${color.start}, ${color.end})`,
                }}
              />
              <span className="text-xs font-medium text-slate-200">
                {color.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
