import { supabase } from "@/lib/supabaseClient";
import RegionFilter from "./RegionFilter";
import MapView, { Jam } from "./MapView";
import Link from "next/link";

type SearchParams = { [key: string]: string | string[] | undefined };

function parseListParam(raw: string | string[] | undefined): string[] {
  if (!raw) return [];
  const str = Array.isArray(raw) ? raw[0] : raw;
  return str
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

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
  const jamsForMap: Jam[] = (data ?? []) as Jam[];

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Full-screen map in the background */}
      <div className="absolute inset-0 z-0">
        <MapView jams={jamsForMap} />
      </div>

      {/* Overlay content on top of the map */}
      <div className="pointer-events-none relative z-10 flex h-full flex-col">
        {/* Top bar: title + filters + calendar view */}
        <header className="pointer-events-auto relative z-20 flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold drop-shadow">
            Jam Guide – Northern California
          </h1>

          {/* Right side: Filters + Submit + Calendar View */}
          <div className="flex gap-2">
            <RegionFilter />
            <Link
              href="/submit"
              className="rounded-md border border-slate-700 bg-blue-600/90 px-3 py-1 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Submit a Jam
            </Link>
            <Link
              href="/calendar"
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-100 hover:bg-slate-800"
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
