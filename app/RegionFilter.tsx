"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

// Helper to parse comma-separated query params into string[]
function parseList(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// Helper to toggle a value in a list and update the URL
function toggleListParam(
  key: string,
  value: string,
  current: string[],
  searchParams: URLSearchParams,
  router: ReturnType<typeof useRouter>
) {
  const next = current.includes(value)
    ? current.filter((v) => v !== value)
    : [...current, value];

  const params = new URLSearchParams(searchParams.toString());
  if (next.length > 0) {
    params.set(key, next.join(","));
  } else {
    params.delete(key);
  }

  router.push(params.toString() ? `/?${params}` : "/");
}

// Helper to toggle a boolean param (stored as "1" when on)
function toggleBooleanParam(
  key: string,
  searchParams: URLSearchParams,
  router: ReturnType<typeof useRouter>
) {
  const params = new URLSearchParams(searchParams.toString());
  const current = params.get(key) === "1";
  if (current) {
    params.delete(key);
  } else {
    params.set(key, "1");
  }
  router.push(params.toString() ? `/?${params}` : "/");
}

// ------------- OPTION SETS (DB VALUES) -------------

// These values must match your Supabase `region` column
const REGION_OPTIONS = [
  { label: "East Bay", value: "East Bay" },
  { label: "San Francisco", value: "San Francisco" },
  { label: "Marin County", value: "Marin County" },
  { label: "Sonoma County", value: "Sonoma County" },
];

// These must match your `city` column values (extend as needed)
const CITY_OPTIONS = [
  { label: "Berkeley", value: "Berkeley" },
  { label: "San Francisco", value: "San Francisco" },
  { label: "Fairfax", value: "Fairfax" },
  { label: "Graton", value: "Graton" },
  { label: "Bolinas", value: "Bolinas" },
];

// These must match your `greater_region` column values
const GREATER_REGION_OPTIONS = [
  { label: "Northern California", value: "Northern California" },
  { label: "Southern California", value: "Southern California" },
];

// day_of_week values taken from your template (Mon, Tue, Wed, Thur, Fri, Sat, Sun)
const DAY_OF_WEEK_OPTIONS = [
  { label: "Mon", value: "Mon" },
  { label: "Tue", value: "Tue" },
  { label: "Wed", value: "Wed" },
  { label: "Thu", value: "Thur" }, // DB uses "Thur"
  { label: "Fri", value: "Fri" },
  { label: "Sat", value: "Sat" },
  { label: "Sun", value: "Sun" },
];

// time_of_day values from your template
const TIME_OF_DAY_OPTIONS = [
  { label: "Morning / Daytime", value: "morning" },
  { label: "Evening", value: "evening" },
  { label: "Night", value: "nightime" },
  { label: "Late Night", value: "late_night" },
];

// primary_genre values from your template (extend as you like)
const GENRE_OPTIONS = [
  { label: "Bluegrass", value: "bluegrass" },
  { label: "Old Time", value: "old time" },
  { label: "Jazz", value: "jazz" },
  { label: "Jam Band", value: "jam_band" },
  { label: "Folk", value: "folk" },
  { label: "Singer-Songwriter", value: "singer_songwriter" },
  { label: "Gypsy Jazz", value: "gypsy_jazz" },
  { label: "Country", value: "country" },
  { label: "Celtic", value: "celtic" },
  { label: "Funk", value: "funk" },
  { label: "Funk Fusion", value: "funk_fusion" },
  { label: "Fusion", value: "fusion" },
  { label: "Rock", value: "rock" },
  { label: "Blues", value: "blues" },
  { label: "Free Jazz", value: "free_jazz" },
  { label: "Free Improv", value: "free_improv" },
  { label: "DJ / Electronic", value: "DJ" },
  { label: "Other", value: "Other" },
];

// skill_level values from your template
const SKILL_OPTIONS = [
  { label: "Beginner", value: "Begginer" },
  { label: "Beginner / Intermediate", value: "Begginer_Intermediate" },
  { label: "Intermediate", value: "Intermediate" },
  { label: "Advanced / Intermediate", value: "Advanced_Intermediate" },
  { label: "Advanced", value: "Advanced" },
  { label: "Pro", value: "Pro" },
  { label: "All Skill Levels", value: "all_skill_levels" },
];

// invite_status values from your template
const INVITE_OPTIONS = [
  { label: "Public / Walk-in", value: "public" },
  { label: "Contact for Invite", value: "contact_for_invite" },
  { label: "Invite Only", value: "invite_only" },
  { label: "Jam-bot Operated", value: "jam_bot_operated" },
];

// avg_crowd_size values from your template
const CROWD_OPTIONS = [
  { label: "Small", value: "small" },
  { label: "Medium", value: "medium" },
  { label: "Large", value: "large" },
  { label: "Fluctuates", value: "fluctuates" },
  { label: "Small but Growing", value: "small_but_growing" },
  { label: "Medium and Growing", value: "medium_and_growing" },
];

// cover_charge_type values from your template
const COVER_TYPE_OPTIONS = [
  { label: "Free", value: "free" },
  { label: "Suggested Donation", value: "suggested_donation" },
  { label: "Paid / Cover Charge", value: "cost_money" },
  { label: "Other / TBD", value: "etc." },
];

// event_kind values from your template
const EVENT_KIND_OPTIONS = [
  { label: "Jam Session", value: "jam_session" },
  { label: "Concert / Performance", value: "concert" },
  { label: "Dance", value: "dance" },
  { label: "Workshop", value: "workshop" },
  { label: "Class", value: "class" },
  { label: "Retreat", value: "retreat" },
  { label: "Camp", value: "camp" },
  { label: "Festival", value: "festival" },
  { label: "Other", value: "other" },
];

// frequency values from your template
const FREQUENCY_OPTIONS = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly (generic)", value: "monthly" },
  { label: "1st Monthly", value: "1st_monthly" },
  { label: "2nd Monthly", value: "2nd_monthly" },
  { label: "3rd Monthly", value: "3rd_monthly" },
  { label: "4th Monthly", value: "4th_monthly" },
  { label: "1st & 3rd Monthly", value: "1nd_3th_monthly" },
  { label: "2nd & 4th Monthly", value: "2nd_4th_monthly" },
  { label: "Yearly", value: "yearly" },
  { label: "One-off", value: "one_off" },
];

// ------------- MAIN FILTER DRAWER -------------

export default function RegionFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  // read selected values from URL for each axis
  const selectedRegions = parseList(searchParams.get("regions"));
  const selectedCities = parseList(searchParams.get("cities"));
  const selectedGreaterRegions = parseList(searchParams.get("greater_regions"));

  const selectedDows = parseList(searchParams.get("dow"));
  const selectedTod = parseList(searchParams.get("tod"));

  const selectedGenres = parseList(searchParams.get("genres"));
  const selectedSkills = parseList(searchParams.get("skills"));

  const selectedInvite = parseList(searchParams.get("invite"));
  const selectedCrowd = parseList(searchParams.get("crowd"));
  const selectedCoverType = parseList(searchParams.get("cover_type"));

  const selectedKinds = parseList(searchParams.get("kind"));
  const selectedFreq = parseList(searchParams.get("freq"));

  const isHouseJamOnly = searchParams.get("is_house_jam") === "1";
  const includesDancingOnly = searchParams.get("dancing") === "1";

  const sp = new URLSearchParams(searchParams.toString());

  const resetAll = () => {
    router.push("/");
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger button */}
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-100 hover:bg-slate-800"
        >
          Filters
        </button>
      </div>

      {/* Slide-out drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Dim background */}
          <div
            className="flex-1 bg-black/40"
            onClick={() => setIsOpen(false)}
          />

          {/* Right-side panel */}
          <div className="w-full max-w-md bg-slate-950 border-l border-slate-800 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-100">
                Filter Jams
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-sm text-slate-400 hover:text-slate-200"
              >
                Close
              </button>
            </div>

            {/* LOCATION */}
            <section className="mb-4">
              <h3 className="text-sm font-medium text-slate-200 mb-2">
                Region
              </h3>
              <div className="space-y-1">
                {REGION_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedRegions.includes(opt.value)}
                      onChange={() =>
                        toggleListParam(
                          "regions",
                          opt.value,
                          selectedRegions,
                          sp,
                          router
                        )
                      }
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </section>

            <section className="mb-4">
              <h3 className="text-sm font-medium text-slate-200 mb-2">
                City
              </h3>
              <div className="space-y-1">
                {CITY_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedCities.includes(opt.value)}
                      onChange={() =>
                        toggleListParam(
                          "cities",
                          opt.value,
                          selectedCities,
                          sp,
                          router
                        )
                      }
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </section>

            <section className="mb-4">
              <h3 className="text-sm font-medium text-slate-200 mb-2">
                Greater Region
              </h3>
              <div className="space-y-1">
                {GREATER_REGION_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedGreaterRegions.includes(opt.value)}
                      onChange={() =>
                        toggleListParam(
                          "greater_regions",
                          opt.value,
                          selectedGreaterRegions,
                          sp,
                          router
                        )
                      }
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </section>

            <section className="mb-4">
              <h3 className="text-sm font-medium text-slate-200 mb-2">
                House Jams
              </h3>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isHouseJamOnly}
                  onChange={() =>
                    toggleBooleanParam("is_house_jam", sp, router)
                  }
                />
                Only show house jams
              </label>
            </section>

            {/* DAY & TIME */}
            <section className="mb-4">
              <h3 className="text-sm font-medium text-slate-200 mb-2">
                Day of Week
              </h3>
              <div className="flex flex-wrap gap-2">
                {DAY_OF_WEEK_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      toggleListParam("dow", opt.value, selectedDows, sp, router)
                    }
                    className={`px-2 py-1 rounded text-xs border ${
                      selectedDows.includes(opt.value)
                        ? "bg-slate-100 text-slate-900 border-slate-100"
                        : "bg-slate-900 text-slate-100 border-slate-600"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="mb-4">
              <h3 className="text-sm font-medium text-slate-200 mb-2">
                Time of Day
              </h3>
              <div className="space-y-1">
                {TIME_OF_DAY_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedTod.includes(opt.value)}
                      onChange={() =>
                        toggleListParam(
                          "tod",
                          opt.value,
                          selectedTod,
                          sp,
                          router
                        )
                      }
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </section>

            {/* GENRE & SKILL */}
            <section className="mb-4">
              <h3 className="text-sm font-medium text-slate-200 mb-2">
                Primary Genre
              </h3>
              <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                {GENRE_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedGenres.includes(opt.value)}
                      onChange={() =>
                        toggleListParam(
                          "genres",
                          opt.value,
                          selectedGenres,
                          sp,
                          router
                        )
                      }
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </section>

            <section className="mb-4">
              <h3 className="text-sm font-medium text-slate-200 mb-2">
                Skill Level
              </h3>
              <div className="space-y-1">
                {SKILL_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedSkills.includes(opt.value)}
                      onChange={() =>
                        toggleListParam(
                          "skills",
                          opt.value,
                          selectedSkills,
                          sp,
                          router
                        )
                      }
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </section>

            {/* ACCESS / CROWD / COST */}
            <section className="mb-4">
              <h3 className="text-sm font-medium text-slate-200 mb-2">
                Invite Status
              </h3>
              <div className="space-y-1">
                {INVITE_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedInvite.includes(opt.value)}
                      onChange={() =>
                        toggleListParam(
                          "invite",
                          opt.value,
                          selectedInvite,
                          sp,
                          router
                        )
                      }
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </section>

            <section className="mb-4">
              <h3 className="text-sm font-medium text-slate-200 mb-2">
                Crowd Size
              </h3>
              <div className="space-y-1">
                {CROWD_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedCrowd.includes(opt.value)}
                      onChange={() =>
                        toggleListParam(
                          "crowd",
                          opt.value,
                          selectedCrowd,
                          sp,
                          router
                        )
                      }
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </section>

            <section className="mb-4">
              <h3 className="text-sm font-medium text-slate-200 mb-2">
                Cover Charge
              </h3>
              <div className="space-y-1">
                {COVER_TYPE_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedCoverType.includes(opt.value)}
                      onChange={() =>
                        toggleListParam(
                          "cover_type",
                          opt.value,
                          selectedCoverType,
                          sp,
                          router
                        )
                      }
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </section>

            <section className="mb-4">
              <h3 className="text-sm font-medium text-slate-200 mb-2">
                Dancing
              </h3>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={includesDancingOnly}
                  onChange={() => toggleBooleanParam("dancing", sp, router)}
                />
                Only show events that include dancing
              </label>
            </section>

            {/* EVENT TYPE & FREQUENCY */}
            <section className="mb-4">
              <h3 className="text-sm font-medium text-slate-200 mb-2">
                Event Kind
              </h3>
              <div className="space-y-1">
                {EVENT_KIND_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedKinds.includes(opt.value)}
                      onChange={() =>
                        toggleListParam(
                          "kind",
                          opt.value,
                          selectedKinds,
                          sp,
                          router
                        )
                      }
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </section>

            <section className="mb-6">
              <h3 className="text-sm font-medium text-slate-200 mb-2">
                Frequency
              </h3>
              <div className="space-y-1">
                {FREQUENCY_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedFreq.includes(opt.value)}
                      onChange={() =>
                        toggleListParam(
                          "freq",
                          opt.value,
                          selectedFreq,
                          sp,
                          router
                        )
                      }
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </section>

            {/* RESET */}
            <button
              type="button"
              onClick={resetAll}
              className="w-full rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-100 hover:bg-slate-900"
            >
              Reset all filters
            </button>
          </div>
        </div>
      )}
    </>
  );
}
