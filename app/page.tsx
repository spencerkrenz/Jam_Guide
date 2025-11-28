import { supabase } from "@/lib/supabaseClient";
import RegionFilter from "./RegionFilter";
import type { Jam } from "./MapView";
import MapWrapper from "./MapWrapper";
import Link from "next/link";
import NextImage from "next/image";

const MapView = MapWrapper;

type SearchParams = { [key: string]: string | string[] | undefined };

function parseListParam(raw: string | string[] | undefined): string[] {
  if (!raw) return [];
  const str = Array.isArray(raw) ? raw[0] : raw;
  return str
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

import { isNotable } from "@/lib/jamUtils";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // Resolve the promise-based searchParams (Next 16)
  const params = await searchParams;

  const regions = parseListParam(params.regions);
  const cities = parseListParam(params.cities);
  const greaterRegions = parseListParam(params.greater_regions);
  const dows = parseListParam(params.dow);
  const timeOfDay = parseListParam(params.tod);
  const genres = parseListParam(params.genres);
  const skills = parseListParam(params.skills);
  const invite = parseListParam(params.invite);
  const crowd = parseListParam(params.crowd);
  const coverType = parseListParam(params.cover_type);
  const kinds = parseListParam(params.kind);
  const freq = parseListParam(params.freq);

  const isHouseJamOnly =
    params.is_house_jam === "true" || params.is_house_jam === "1";
  const includesDancingOnly =
    params.dancing === "true" || params.dancing === "1";
  const isNotableOnly = params.notable === "1";

  let query = supabase.from("jams").select("*").eq("status", "active");

  if (regions.length > 0) query = query.in("region", regions);
  if (cities.length > 0) query = query.in("city", cities);
  if (greaterRegions.length > 0)
    query = query.in("greater_region", greaterRegions);
  if (isHouseJamOnly) query = query.eq("is_house_jam", true);
  if (dows.length > 0) query = query.in("day_of_week", dows);
  if (timeOfDay.length > 0) query = query.in("time_of_day", timeOfDay);
  if (genres.length > 0) query = query.in("primary_genre", genres);
  if (skills.length > 0) query = query.in("skill_level", skills);
  if (invite.length > 0) query = query.in("invite_status", invite);
  if (crowd.length > 0) query = query.in("avg_crowd_size", crowd);
  if (coverType.length > 0) query = query.in("cover_charge_type", coverType);
  if (includesDancingOnly) query = query.eq("includes_dancing", true);
  if (kinds.length > 0) query = query.in("event_kind", kinds);
  if (freq.length > 0) query = query.in("frequency", freq);

  const { data, error } = await query.order("event_name", { ascending: true });

  if (error) {
    console.error("Error loading jams:", error.message);
  }

  // Convert Supabase rows to the Jam type that MapView expects
  let jamsForMap: Jam[] = (data ?? []) as Jam[];

  if (isNotableOnly) {
    jamsForMap = jamsForMap.filter(isNotable);
  }

  return (
    <main className="mobile-shell relative h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Full-screen map in the background */}
      <div className="absolute inset-0 z-0">
        <MapView jams={jamsForMap} />
      </div>

      {/* Overlay content on top of the map */}
      <div className="pointer-events-none relative z-10 flex h-full flex-col">
        {/* Top bar: title + filters + calendar view */}
        {/* Top bar: title + filters + calendar view */}
        <header className="mobile-topbar pointer-events-auto relative z-20 flex flex-col md:flex-row items-stretch md:items-center justify-between p-4 gap-4 md:gap-0 bg-slate-900/80 md:bg-transparent backdrop-blur-md md:backdrop-blur-none border-b border-slate-700 md:border-none">
          <div className="topbar-brand flex items-center justify-between md:justify-start gap-3">
            <h1 className="ml-0 md:ml-8">
              <NextImage
                src="/images/jamguide-logo-transparent.png"
                alt="JamGuide"
                width={200}
                height={80}
                className="h-20 w-auto"
              />
            </h1>
            <span className="version-pill hidden md:block rounded-md bg-slate-900/70 px-3 py-1 text-[11px] font-medium text-slate-200/80">
              v0 (only in Northern California for now! Text me at (415) 858-8640 if you want to be involved!)
            </span>
          </div>

          {/* Right side: Filters + Submit + Calendar View */}
          <div className="topbar-actions grid grid-cols-3 gap-2 md:flex md:gap-2">
            <RegionFilter />
            <Link
              href="/submit"
              className="rounded-md border border-slate-700 bg-blue-600/90 px-3 py-1 text-sm font-semibold text-white hover:bg-blue-500 text-center flex items-center justify-center"
            >
              Submit a Jam
            </Link>
            <Link
              href="/calendar"
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-100 hover:bg-slate-800 text-center flex items-center justify-center"
            >
              Calendar View
            </Link>
          </div>
        </header>

        {/* Reserved space for future overlays (jam list panel, etc.) */}
        <section className="flex-1" />
      </div>
    </main>
  );
}
