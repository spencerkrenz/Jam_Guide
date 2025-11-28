"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  REGION_OPTIONS,
  DAY_OF_WEEK_OPTIONS,
  TIME_OF_DAY_OPTIONS,
  GENRE_OPTIONS,
  SKILL_LEVEL_OPTIONS,
  FREQUENCY_OPTIONS,
} from "@/lib/filterConfig";

type FiltersPanelProps = {
  // slugs currently selected (from URL)
  initialRegions: string[];
  initialDaysOfWeek: string[];
  initialTimesOfDay: string[];
  initialGenres: string[];
  initialSkillLevels: string[];
  initialFrequencies: string[];
  initialAdvancedOnly: boolean;
  initialNotableOnly: boolean;
};

function toggleInList(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

export default function FiltersPanel(props: FiltersPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [regions, setRegions] = React.useState<string[]>(props.initialRegions);
  const [daysOfWeek, setDaysOfWeek] = React.useState<string[]>(props.initialDaysOfWeek);
  const [timesOfDay, setTimesOfDay] = React.useState<string[]>(props.initialTimesOfDay);
  const [genres, setGenres] = React.useState<string[]>(props.initialGenres);
  const [skillLevels, setSkillLevels] = React.useState<string[]>(props.initialSkillLevels);
  const [frequencies, setFrequencies] = React.useState<string[]>(props.initialFrequencies);
  const [advancedOnly, setAdvancedOnly] = React.useState<boolean>(props.initialAdvancedOnly);
  const [notableOnly, setNotableOnly] = React.useState<boolean>(props.initialNotableOnly);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    const setList = (key: string, list: string[]) => {
      if (list.length) {
        params.set(key, list.join(","));
      } else {
        params.delete(key);
      }
    };

    setList("regions", regions);
    setList("dow", daysOfWeek);
    setList("tod", timesOfDay);
    setList("genres", genres);
    setList("skill", skillLevels);
    setList("freq", frequencies);

    if (advancedOnly) {
      params.set("adv", "1");
    } else {
      params.delete("adv");
    }

    if (notableOnly) {
      params.set("notable", "1");
    } else {
      params.delete("notable");
    }

    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/");
  };

  return (
    <aside className="w-full max-w-xs bg-slate-900/90 text-slate-100 p-4 rounded-lg border border-slate-800 mb-6">
      <h2 className="text-lg font-semibold mb-4">Filter Jams</h2>

      {/* Region */}
      <section className="mb-4">
        <h3 className="text-sm font-medium mb-2">Region</h3>
        <div className="space-y-1">
          {REGION_OPTIONS.map((opt) => (
            <label key={opt.slug} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={regions.includes(opt.slug)}
                onChange={() => setRegions(toggleInList(regions, opt.slug))}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </section>

      {/* Day of Week */}
      <section className="mb-4">
        <h3 className="text-sm font-medium mb-2">Day of Week</h3>
        <div className="flex flex-wrap gap-2">
          {DAY_OF_WEEK_OPTIONS.map((opt) => (
            <button
              key={opt.slug}
              type="button"
              onClick={() => setDaysOfWeek(toggleInList(daysOfWeek, opt.slug))}
              className={`px-2 py-1 rounded text-xs border ${daysOfWeek.includes(opt.slug)
                ? "bg-slate-100 text-slate-900"
                : "bg-slate-900 text-slate-100 border-slate-600"
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Time of Day */}
      <section className="mb-4">
        <h3 className="text-sm font-medium mb-2">Time of Day</h3>
        <div className="space-y-1">
          {TIME_OF_DAY_OPTIONS.map((opt) => (
            <label key={opt.slug} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={timesOfDay.includes(opt.slug)}
                onChange={() =>
                  setTimesOfDay(toggleInList(timesOfDay, opt.slug))
                }
              />
              {opt.label}
            </label>
          ))}
        </div>
      </section>

      {/* Most Notable Filter */}
      <section className="mb-4">
        <button
          type="button"
          onClick={() => setNotableOnly(!notableOnly)}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md border text-sm font-medium transition-colors ${notableOnly
            ? "bg-amber-500/20 border-amber-500 text-amber-200"
            : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
            }`}
        >
          {notableOnly ? (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Showing Most Notable Jam&apos;s Only
            </>
          ) : (
            "Show Most Notable Jam's Only"
          )}
        </button>
      </section>

      {/* Genre */}
      <section className="mb-4">
        <h3 className="text-sm font-medium mb-2">Genre</h3>
        <div className="space-y-1">
          {GENRE_OPTIONS.map((opt) => (
            <label key={opt.slug} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={genres.includes(opt.slug)}
                onChange={() => setGenres(toggleInList(genres, opt.slug))}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </section>

      {/* Skill Level */}
      <section className="mb-4">
        <h3 className="text-sm font-medium mb-2">Skill Level</h3>
        <div className="space-y-1">
          {SKILL_LEVEL_OPTIONS.map((opt) => (
            <label key={opt.slug} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={skillLevels.includes(opt.slug)}
                onChange={() =>
                  setSkillLevels(toggleInList(skillLevels, opt.slug))
                }
              />
              {opt.label}
            </label>
          ))}
        </div>
        <button
          type="button"
          className={`mt-2 text-xs underline ${advancedOnly ? "text-amber-400" : "text-slate-400"
            }`}
          onClick={() => setAdvancedOnly(!advancedOnly)}
        >
          Advanced/Pro only
        </button>
      </section>

      {/* Frequency */}
      <section className="mb-4">
        <h3 className="text-sm font-medium mb-2">Frequency</h3>
        <div className="space-y-1">
          {FREQUENCY_OPTIONS.map((opt) => (
            <label key={opt.slug} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={frequencies.includes(opt.slug)}
                onChange={() =>
                  setFrequencies(toggleInList(frequencies, opt.slug))
                }
              />
              {opt.label}
            </label>
          ))}
        </div>
      </section>

      <button
        type="button"
        onClick={applyFilters}
        className="mt-2 w-full rounded-md bg-indigo-500 hover:bg-indigo-400 text-sm font-medium py-2"
      >
        Apply Filters
      </button>
    </aside>
  );
}
