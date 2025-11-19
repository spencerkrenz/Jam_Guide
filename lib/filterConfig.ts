// lib/filterConfig.ts

export type FilterOption = {
  label: string;      // what you see in the UI
  slug: string;       // what goes in the URL, eg "east_bay"
  dbValues: string[]; // actual values in the DB column
};

// REGION – using NorCal groupings, but structure is global-ready.
export const REGION_OPTIONS: FilterOption[] = [
  { label: "San Francisco", slug: "sf", dbValues: ["San Francisco"] },
  { label: "East Bay", slug: "east_bay", dbValues: ["East Bay"] },
  // North Bay = both Marin & Sonoma in your CSV
  { label: "North Bay", slug: "north_bay", dbValues: ["Marin County", "Sonoma County"] },
  // These two will work once you start using those region strings in the sheet
  { label: "South Bay", slug: "south_bay", dbValues: ["South Bay"] },
  { label: "Peninsula", slug: "peninsula", dbValues: ["Peninsula"] },
];

// DAY OF WEEK – matches your CSV: Mon, Tue, Wed, Thur, Fri, Sat, Sun
export const DAY_OF_WEEK_OPTIONS: FilterOption[] = [
  { label: "Mon", slug: "Mon", dbValues: ["Mon"] },
  { label: "Tue", slug: "Tue", dbValues: ["Tue"] },
  { label: "Wed", slug: "Wed", dbValues: ["Wed"] },
  // You store "Thur" in the CSV; we display "Thu"
  { label: "Thu", slug: "Thur", dbValues: ["Thur"] },
  { label: "Fri", slug: "Fri", dbValues: ["Fri"] },
  { label: "Sat", slug: "Sat", dbValues: ["Sat"] },
  { label: "Sun", slug: "Sun", dbValues: ["Sun"] },
];

// TIME OF DAY – based on your "morning", "evening", "nightime", "late_night"
export const TIME_OF_DAY_OPTIONS: FilterOption[] = [
  { label: "Daytime", slug: "daytime", dbValues: ["morning"] },
  { label: "Evening", slug: "evening", dbValues: ["evening"] },
  { label: "Nighttime", slug: "nighttime", dbValues: ["nightime", "late_night"] },
];

// GENRE – initial v1 focus
export const GENRE_OPTIONS: FilterOption[] = [
  { label: "Bluegrass", slug: "bluegrass", dbValues: ["bluegrass"] },
  { label: "Jazz", slug: "jazz", dbValues: ["jazz"] },
  { label: "Jam Band", slug: "jam_band", dbValues: ["jam_band"] },
];

// SKILL LEVEL – mapping your more granular values into the UX buckets
export const SKILL_LEVEL_OPTIONS: FilterOption[] = [
  {
    label: "Beginner Friendly",
    slug: "beginner_friendly",
    dbValues: ["Begginer", "Begginer_Intermediate", "all_skill_levels"],
  },
  {
    label: "Mixed",
    slug: "mixed",
    dbValues: ["Intermediate", "Advanced_Intermediate", "all_skill_levels"],
  },
  {
    label: "Advanced",
    slug: "advanced",
    dbValues: ["Advanced", "Advanced_Intermediate"],
  },
  {
    label: "Pro",
    slug: "pro",
    dbValues: ["Pro"],
  },
];

// FREQUENCY – using your CSV enums
export const FREQUENCY_OPTIONS: FilterOption[] = [
  { label: "Weekly", slug: "weekly", dbValues: ["weekly"] },
  {
    label: "Biweekly",
    slug: "biweekly",
    dbValues: ["1nd_3th_monthly"], // 1st & 3rd monthly = roughly biweekly
  },
  {
    label: "Monthly",
    slug: "monthly",
    dbValues: ["monthly", "1st_monthly", "2nd_monthly", "3rd_monthly", "4th_monthly"],
  },
  {
    label: "2nd 4th Monthly",
    slug: "2nd_4th_monthly",
    dbValues: ["2nd_4th_monthly"],
  },
  {
    label: "One Off",
    slug: "one_off",
    dbValues: ["one_off"], // you can start using this value in the CSV
  },
];

// Merge dbValues for whichever slugs are selected
export function dbValuesForSelected(
  options: FilterOption[],
  selectedSlugs: string[],
): string[] {
  const set = new Set<string>();
  for (const opt of options) {
    if (selectedSlugs.includes(opt.slug)) {
      opt.dbValues.forEach((v) => set.add(v));
    }
  }
  return Array.from(set);
}

// Parse comma-separated query params into string[]
export function parseListParam(
  raw: string | string[] | undefined,
): string[] {
  if (!raw) return [];
  const str = Array.isArray(raw) ? raw[0] : raw;
  return str
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
