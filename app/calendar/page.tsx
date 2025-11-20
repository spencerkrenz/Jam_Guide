// app/calendar/page.tsx

import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

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

  // 2. Fetch all active jams (we could narrow the columns, but * is fine for now)
  const { data, error } = await supabase
    .from("jams")
    .select("*")
    .eq("status", "active");

  if (error) {
    console.error("Error loading jams for calendar:", error.message);
  }

  const jams = (data ?? []) as Jam[];

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
            href={`/calendar?year=${prevYear}&month=${prevMonth}`}
            className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm hover:bg-slate-800"
          >
            ←
          </Link>
          <Link
            href={`/calendar?year=${nextYear}&month=${nextMonth}`}
            className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm hover:bg-slate-800"
          >
            →
          </Link>

          <div className="ml-2">
            <h1 className="text-2xl font-bold">Jam Guide – Calendar View</h1>
            <p className="text-sm text-slate-400">{monthLabel}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href="/"
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

              return (
                <div
                  key={`day-${day}`}
                  className="flex h-28 flex-col bg-slate-950 px-1 py-1"
                >
                  {/* Day number + count */}
                  <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-amber-300">
                    <span>{day}</span>
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
                          const start = jam.start_time?.slice(0, 5) ?? "";
                          return (
                            <div
                              key={jam.id}
                              className="truncate rounded bg-slate-900/80 px-1 py-[2px] text-[10px] text-slate-100"
                            >
                              {start && <span>{start} – </span>}
                              <span>{jam.event_name || "Untitled"}</span>
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
