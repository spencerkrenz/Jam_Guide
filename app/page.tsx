import { supabase } from "@/lib/supabaseClient";
import RegionFilter from "./RegionFilter";
import MapView from "./MapView";

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
  const params = await searchParams;

  // LOCATION
  const regions = parseListParam(params.regions);
  const cities = parseListParam(params.cities);
  const greaterRegions = parseListParam(params.greater_regions);
  const isHouseJamOnly =
    (typeof params.is_house_jam === "string" && params.is_house_jam === "1") ||
    (Array.isArray(params.is_house_jam) &&
      params.is_house_jam[0] === "1");

  // DAY & TIME
  const dows = parseListParam(params.dow);
  const timeOfDay = parseListParam(params.tod);

  // GENRE & SKILL
  const genres = parseListParam(params.genres);
  const skills = parseListParam(params.skills);

  // ACCESS / CROWD / COST
  const invite = parseListParam(params.invite);
  const crowd = parseListParam(params.crowd);
  const coverType = parseListParam(params.cover_type);
  const includesDancingOnly =
    (typeof params.dancing === "string" && params.dancing === "1") ||
    (Array.isArray(params.dancing) && params.dancing[0] === "1");

  // EVENT TYPE / FREQUENCY
  const kinds = parseListParam(params.kind);
  const freq = parseListParam(params.freq);

  let query = supabase.from("jams").select("*").eq("status", "active");

  // Apply filters only when something is selected on that axis

  if (regions.length > 0) {
    query = query.in("region", regions);
  }

  if (cities.length > 0) {
    query = query.in("city", cities);
  }

  if (greaterRegions.length > 0) {
    query = query.in("greater_region", greaterRegions);
  }

  if (isHouseJamOnly) {
    query = query.eq("is_house_jam", true);
  }

  if (dows.length > 0) {
    query = query.in("day_of_week", dows);
  }

  if (timeOfDay.length > 0) {
    query = query.in("time_of_day", timeOfDay);
  }

  if (genres.length > 0) {
    query = query.in("primary_genre", genres);
  }

  if (skills.length > 0) {
    query = query.in("skill_level", skills);
  }

  if (invite.length > 0) {
    query = query.in("invite_status", invite);
  }

  if (crowd.length > 0) {
    query = query.in("avg_crowd_size", crowd);
  }

  if (coverType.length > 0) {
    query = query.in("cover_charge_type", coverType);
  }

  if (includesDancingOnly) {
    query = query.eq("includes_dancing", true);
  }

  if (kinds.length > 0) {
    query = query.in("event_kind", kinds);
  }

  if (freq.length > 0) {
    query = query.in("frequency", freq);
  }

  const { data, error } = await query.order("event_name", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
  }

  const jams = data ?? [];

return (
  <main className="min-h-screen p-8 bg-slate-950 text-slate-100">
    <h1 className="text-3xl font-bold mb-4">Jam Guide – Northern California</h1>

    {/* Right-side filter drawer trigger + filters */}
    <RegionFilter />

    {/* Map using the same filtered jams */}
    <MapView jams={jams as any} />

    {jams.length === 0 ? (
      <p className="text-sm text-slate-400">No events found.</p>
    ) : (
      <div className="space-y-4">
        {jams.map((jam: any) => (
          <div
            key={jam.id}
            className="bg-slate-900 border border-slate-800 p-4 rounded"
          >
            <h2 className="text-lg font-semibold">
              {jam.event_name || "Untitled event"}
            </h2>
            <p className="text-sm text-slate-400">
              {jam.city} • {jam.region} • {jam.venue_name}
            </p>
            <p className="text-sm text-slate-300">
              {jam.day_of_week}
              {jam.recurrence_description
                ? ` • ${jam.recurrence_description}`
                : ""}
            </p>
            <p className="text-xs text-slate-500">
              {jam.primary_genre} • {jam.skill_level} • {jam.event_kind}
            </p>
          </div>
        ))}
      </div>
    )}
  </main>
);
}

