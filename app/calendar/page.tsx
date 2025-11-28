// app/calendar/page.tsx

import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import RegionFilter from "../RegionFilter";
import { isNotable } from "@/lib/jamUtils";

type Jam = {
  id: number;
  event_name: string | null;
  venue_name: string | null;
  city: string | null;
  region: string | null;
  day_of_week: string | null; // "Sun", "Mon", etc.
  start_time: string | null;  // "19:00:00"
  end_time: string | null;
  primary_genre: string | null;
  skill_level: string | null;
  event_kind: string | null;
  recurrence_description: string | null;
  start_date: string | null;      // "2025-11-20"
  end_date: string | null;        // "2025-11-22"
  frequency: string | null;       // "weekly", "one_off", "2nd_4th_monthly", etc.
  weeks_of_month: string | null;  // "2,4"
  is_festival: boolean | null;
};

type SearchParams = { [key: string]: string | string[] | undefined };

function parseListParam(raw: string | string[] | undefined): string[] {
  if (!raw) return [];
  const str = Array.isArray(raw) ? raw[0] : raw;
  return str
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// Sunday-first like your reference calendar
const DAYS: { key: string; label: string }[] = [
  { key: "Sun", label: "Sunday" },
  { key: "Mon", label: "Monday" },
  { key: "Tue", label: "Tuesday" },
  { key: "Wed", label: "Wednesday" },
  { key: "Thu", label: "Thursday" },
  { key: "Fri", label: "Friday" },
  { key: "Sat", label: "Saturday" },
];

// Given a JS Date, return our day key ("Sun", "Mon", etc.)
function getDayKey(date: Date): string {
  const jsIndex = date.getDay(); // 0 = Sun ... 6 = Sat
  return DAYS[jsIndex].key;
}

// Safely read a single string from searchParams
function getParam(params: SearchParams, key: string): string | undefined {
  const raw = params[key];
  if (!raw) return undefined;
  return Array.isArray(raw) ? raw[0] : raw;
}

// Parse "2025-11-20" into a Date at local midnight
function parseDate(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

// Parse "1,3" or "2,4" into [1,3] etc.
function parseWeeksOfMonth(weeks: string | null): number[] {
  if (!weeks) return [];
  return weeks
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !Number.isNaN(n) && n >= 1 && n <= 5);
}

// Format Supabase time ("19:00:00") into "19:00"
function formatTime(t: string | null): string {
  if (!t) return "";
  return t.slice(0, 5);
}

function occursOnDate(jam: Jam, date: Date): boolean {
  const dayKey = getDayKey(date);
  const freqRaw = (jam.frequency ?? "").toLowerCase();

  const start = parseDate(jam.start_date);
  const end = parseDate(jam.end_date);

  // Respect date range if provided
  if (start && date < start) return false;
  if (end && date > end) return false;

  // One-off events
  if (freqRaw === "one_off") {
    if (!start) return false;

    // One-off festival with date range => occurs on each day in range
    if (jam.is_festival && end) {
      return date >= start && date <= end;
    }

    // Simple one-day event
    return date.toDateString() === start.toDateString();
  }

  // Festivals with a date range: show them on each day in the range
  if (jam.is_festival && start && end) {
    return date >= start && date <= end;
  }

  // Recurring patterns: must match weekday
  if (!jam.day_of_week || jam.day_of_week !== dayKey) {
    return false;
  }

  const weekOfMonth = Math.floor((date.getDate() - 1) / 7) + 1;
  const weeksList = parseWeeksOfMonth(jam.weeks_of_month);

  // Biweekly: use start_date as the phase if available
  if (freqRaw === "biweekly") {
    if (!start) {
      // If we don't know phase, treat as weekly on that weekday
      return true;
    }
    const diffMs = date.getTime() - start.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    return diffWeeks % 2 === 0;
  }

  // Monthly-style patterns
  if (freqRaw.includes("monthly")) {
    if (weeksList.length > 0) {
      // Explicit weeks_of_month field wins
      return weeksList.includes(weekOfMonth);
    }

    if (freqRaw.startsWith("1st")) return weekOfMonth === 1;
    if (freqRaw.startsWith("2nd_4th")) return weekOfMonth === 2 || weekOfMonth === 4;
    if (freqRaw.startsWith("2nd")) return weekOfMonth === 2;
    if (freqRaw.startsWith("3rd")) return weekOfMonth === 3;
    if (freqRaw.startsWith("4th")) return weekOfMonth === 4;

    // Plain "monthly" with no weeks_of_month: default to 1st week
    return weekOfMonth === 1;
  }

  // Yearly events: match month/day to start_date
  if (freqRaw === "yearly") {
    if (!start) return false;
    return (
      date.getMonth() === start.getMonth() &&
      date.getDate() === start.getDate()
    );
  }

  // Default: treat as weekly recurring on that weekday
  // (covers "weekly", "irregular", empty frequency, etc.)
  return true;
}

type CalendarCell = {
  date?: number; // 1..daysInMonth if real day, undefined for padding
};

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const baseParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach((v) => baseParams.append(key, v));
    } else {
      baseParams.set(key, value);
    }
  });

  // 1. Determine which month to show from URL, default to current
  const now = new Date();
  const yearParam = getParam(params, "year");
  const monthParam = getParam(params, "month"); // 1–12

  let year = yearParam ? Number(yearParam) : now.getFullYear();
  let monthIndex = monthParam ? Number(monthParam) - 1 : now.getMonth(); // 0–11

  if (Number.isNaN(year) || year < 1970 || year > 2100) {
    year = now.getFullYear();
  }
  if (Number.isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    monthIndex = now.getMonth();
  }

  const firstOfMonth = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const monthLabel = firstOfMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  // Prev / next month dates
  const prevMonthDate = new Date(year, monthIndex - 1, 1);
  const nextMonthDate = new Date(year, monthIndex + 1, 1);

  const prevYear = prevMonthDate.getFullYear();
  const prevMonth = prevMonthDate.getMonth() + 1; // 1–12

  const nextYear = nextMonthDate.getFullYear();
  const nextMonth = nextMonthDate.getMonth() + 1; // 1–12

  // 1b. Parse filters from query params
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

  const filtersOnlyParams = new URLSearchParams(baseParams.toString());
  filtersOnlyParams.delete("year");
  filtersOnlyParams.delete("month");

  const prevParams = new URLSearchParams(filtersOnlyParams.toString());
  prevParams.set("year", String(prevYear));
  prevParams.set("month", String(prevMonth));
  const prevHref = `/calendar?${prevParams.toString()}`;

  const nextParams = new URLSearchParams(filtersOnlyParams.toString());
  nextParams.set("year", String(nextYear));
  nextParams.set("month", String(nextMonth));
  const nextHref = `/calendar?${nextParams.toString()}`;

  const mapHref = filtersOnlyParams.toString()
    ? `/?${filtersOnlyParams.toString()}`
    : "/";

  // 2. Fetch all active jams (we could narrow the columns, but * is fine for now)
  let query = supabase.from("jams").select("*").eq("status", "active");

  if (regions.length > 0) query = query.in("region", regions);
  if (cities.length > 0) query = query.in("city", cities);
  if (greaterRegions.length > 0) query = query.in("greater_region", greaterRegions);
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
    console.error("Error loading jams for calendar:", error.message);
  }

  let jams = (data ?? []) as Jam[];

  if (isNotableOnly) {
    jams = jams.filter(isNotable);
  }

  // 3. For this month, compute which jams occur on each exact date
  const jamsByDate: Record<number, Jam[]> = {};
  for (let day = 1; day <= daysInMonth; day++) {
    jamsByDate[day] = [];
  }

  for (const jam of jams) {
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, monthIndex, day);
      if (occursOnDate(jam, date)) {
        jamsByDate[day].push(jam);
      }
    }
  }

  // 4. Build month grid cells (dates + leading padding)
  const cells: CalendarCell[] = [];

  // Padding before the 1st
  const firstDayJsIndex = firstOfMonth.getDay(); // 0 = Sun
  for (let i = 0; i < firstDayJsIndex; i++) {
    cells.push({});
  }

  // Real days
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ date: day });
  }

  // Break into rows of 7
  const rows: CalendarCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top bar with month navigation */}
      <header className="flex items-center justify-between border-b border-slate-800 p-4">
        <div className="flex items-center gap-2">
          {/* Prev / Next month arrows */}
          <Link
            href={prevHref}
            className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm hover:bg-slate-800"
          >
            ←
          </Link>
          <Link
            href={nextHref}
            className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm hover:bg-slate-800"
          >
            →
          </Link>

          <div className="ml-2">
            <h1 className="text-2xl font-bold">Jam Guide – Calendar View</h1>
            <p className="text-sm text-slate-400">{monthLabel}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <RegionFilter />
          <Link
            href="/submit"
            className="rounded-md border border-blue-500/50 bg-blue-600/90 px-3 py-1 text-sm font-semibold text-white hover:bg-blue-500"
          >
            Submit a Jam
          </Link>
          <Link
            href={mapHref}
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-100 hover:bg-slate-800"
          >
            Map View
          </Link>
        </div>
      </header>

      {/* Calendar */}
      <section className="p-4">
        {/* Weekday headers */}
        <div className="mb-2 grid grid-cols-7 text-center text-xs font-semibold text-slate-300">
          {DAYS.map((d) => (
            <div key={d.key} className="py-2">
              {d.label}
            </div>
          ))}
        </div>

        {/* Month grid */}
        <div className="grid grid-cols-7 gap-[1px] border border-slate-800 bg-slate-800">
          {rows.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              if (!cell.date) {
                // Empty cell
                return (
                  <div
                    key={`empty-${rowIndex}-${colIndex}`}
                    className="h-28 bg-slate-950"
                  />
                );
              }

              const day = cell.date;
              const jamsForDay = jamsByDate[day] ?? [];
              const isToday =
                year === now.getFullYear() &&
                monthIndex === now.getMonth() &&
                day === now.getDate();

              return (
                <div
                  key={`day-${day}`}
                  className="flex h-28 flex-col bg-slate-950 px-1 py-1"
                >
                  {/* Day number + count */}
                  <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-amber-300">
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${isToday
                          ? "bg-blue-600/90 text-white ring-2 ring-blue-300/60"
                          : ""
                        }`}
                    >
                      {day}
                    </span>
                    {jamsForDay.length > 0 && (
                      <span className="rounded bg-slate-800 px-1 text-[10px] text-slate-200">
                        {jamsForDay.length}
                      </span>
                    )}
                  </div>

                  {/* Events */}
                  <div className="flex-1 overflow-hidden">
                    {jamsForDay.length === 0 ? (
                      <div className="text-[10px] text-slate-500">
                        No jams
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {jamsForDay.slice(0, 3).map((jam) => {
                          const start = formatTime(jam.start_time);
                          const hasId = Number.isFinite(jam.id);
                          const locationLine = [jam.city, jam.region]
                            .filter(Boolean)
                            .join(" • ");
                          const notable = isNotable(jam);

                          return (
                            <div
                              key={jam.id}
                              className="rounded bg-slate-900/80 px-1 py-[4px] text-[10px] text-slate-100"
                            >
                              <div className="truncate font-semibold flex items-center gap-1">
                                {start && <span>{start} – </span>}
                                <span className="truncate">{jam.event_name || "Untitled"}</span>
                                {notable && (
                                  <svg
                                    width="10"
                                    height="10"
                                    viewBox="0 0 12 12"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="shrink-0"
                                  >
                                    <circle cx="6" cy="6" r="6" fill="#22c55e" />
                                    <path
                                      d="M3 6L5 8L9 4"
                                      stroke="white"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                )}
                              </div>

                              <div className="mt-[2px] flex items-center justify-between gap-2">
                                <span className="truncate text-[9px] text-slate-400">
                                  {locationLine}
                                </span>
                                {hasId && (
                                  <Link
                                    href={`/jam/${jam.id}`}
                                    className="shrink-0 text-[9px] text-blue-400 hover:underline"
                                  >
                                    View details
                                  </Link>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {jamsForDay.length > 3 && (
                          <div className="text-[10px] text-slate-500">
                            +{jamsForDay.length - 3} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <p className="mt-3 text-xs text-slate-500">
          This view uses your start_date / end_date / frequency / weeks_of_month
          fields to approximate recurring patterns (weekly, biweekly, monthly,
          2nd/4th Fridays, one-offs, and festivals across multiple days). We can
          tighten the rules further if you want even more precise behavior.
        </p>
      </section>
    </main>
  );
}
