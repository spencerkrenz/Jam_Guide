// app/submit/page.tsx

"use client";

import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { ChangeEvent, FormEvent, useState } from "react";

type FormState = {
  event_name: string;
  event_kind: string;
  primary_genre: string;
  secondary_genres: string;
  skill_level: string;
  venue_name: string;
  address: string;
  city: string;
  region: string;
  greater_region: string;
  state: string;
  country: string;
  latitude: string;
  longitude: string;
  day_of_week: string;
  frequency: string;
  weeks_of_month: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  recurrence_description: string;
  avg_crowd_size: string;
  time_of_day: string;
  invite_status: string;
  cover_charge_type: string;
  cover_charge_amount: string;
  website_url: string;
  facebook_url: string;
  instagram_url: string;
  other_links: string;
  event_description: string;
  contact_email: string;
  contact_phone: string;
  trad_level: string;
  multiple_jams_at_once: boolean;
  includes_dancing: boolean;
  includes_visual_art: boolean;
  is_house_jam: boolean;
  is_festival: boolean;
};

const emptyForm: FormState = {
  event_name: "",
  event_kind: "",
  primary_genre: "",
  secondary_genres: "",
  skill_level: "",
  venue_name: "",
  address: "",
  city: "",
  region: "",
  greater_region: "",
  state: "",
  country: "",
  latitude: "",
  longitude: "",
  day_of_week: "",
  frequency: "",
  weeks_of_month: "",
  start_date: "",
  end_date: "",
  start_time: "",
  end_time: "",
  recurrence_description: "",
  avg_crowd_size: "",
  time_of_day: "",
  invite_status: "",
  cover_charge_type: "",
  cover_charge_amount: "",
  website_url: "",
  facebook_url: "",
  instagram_url: "",
  other_links: "",
  event_description: "",
  contact_email: "",
  contact_phone: "",
  trad_level: "",
  multiple_jams_at_once: false,
  includes_dancing: false,
  includes_visual_art: false,
  is_house_jam: false,
  is_festival: false,
};

const DAY_OPTIONS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const EVENT_KIND_OPTIONS = [
  "jam_session",
  "concert",
  "dance",
  "workshop",
  "class",
  "retreat",
  "camp",
  "festival",
  "other",
];
const GENRE_OPTIONS = [
  "bluegrass",
  "old_time",
  "jazz",
  "jam_band",
  "folk",
  "singer_songwriter",
  "gypsy_jazz",
  "country",
  "celtic",
  "funk",
  "funk_fusion",
  "fusion",
  "rock",
  "blues",
  "free_jazz",
  "free_improv",
  "DJ",
  "Other",
];
const SKILL_OPTIONS = [
  "Begginer",
  "Begginer_Intermediate",
  "Intermediate",
  "Advanced_Intermediate",
  "Advanced",
  "Pro",
  "all_skill_levels",
];
const FREQUENCY_OPTIONS = [
  "daily",
  "weekly",
  "biweekly",
  "monthly",
  "1st_monthly",
  "2nd_monthly",
  "3rd_monthly",
  "4th_monthly",
  "1nd_3th_monthly",
  "2nd_4th_monthly",
  "yearly",
  "one_off",
];
const TIME_OF_DAY_OPTIONS = ["morning", "evening", "nightime", "late_night"];
const CROWD_OPTIONS = [
  "small",
  "medium",
  "large",
  "fluctuates",
  "small_but_growing",
  "medium_and_growing",
];
const INVITE_OPTIONS = [
  "public",
  "contact_for_invite",
  "invite_only",
  "jam_bot_operated",
];
const COVER_OPTIONS = ["free", "suggested_donation", "cost_money", "etc."];
const REGION_OPTIONS = [
  "East Bay",
  "San Francisco",
  "Marin County",
  "Sonoma County",
];
const GREATER_REGION_OPTIONS = [
  "Northern California",
  "Southern California",
];

const nullIfEmpty = (val: string) => {
  const trimmed = val.trim();
  return trimmed === "" ? null : trimmed;
};

function parseTimeToDb(raw?: string | null) {
  if (raw === undefined || raw === null) return null;
  const val = raw.trim();
  if (!val) return null;

  // 24h formats: HH:MM(:SS)?
  const twentyFour = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;
  const m24 = val.match(twentyFour);
  if (m24) {
    const hours = Number(m24[1]);
    const minutes = Number(m24[2]);
    const seconds = m24[3] ? Number(m24[3]) : 0;
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59 && seconds >= 0 && seconds <= 59) {
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
  }

  // 12h formats: H:MM AM/PM or H AM/PM
  const twelve = /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i;
  const m12 = val.match(twelve);
  if (m12) {
    let hours = Number(m12[1]);
    const minutes = m12[2] ? Number(m12[2]) : 0;
    const suffix = m12[3].toLowerCase();
    if (hours === 12) hours = 0;
    if (suffix === "pm") hours += 12;
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${pad(hours)}:${pad(minutes)}:00`;
    }
  }

  return undefined; // invalid
}

const toNumber = (val: string) => {
  if (!val) return null;
  const num = Number(val);
  return Number.isFinite(num) ? num : null;
};

export default function SubmitJamPage() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange =
    (field: keyof FormState) =>
      (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const value =
          e.target.type === "checkbox"
            ? (e.target as HTMLInputElement).checked
            : e.target.value;
        setForm((prev) => ({ ...prev, [field]: value }));
      };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    // Generate a random 16-digit number for event_id
    // Range: 1,000,000,000,000,000 to 9,007,199,254,740,991 (MAX_SAFE_INTEGER)
    const minId = 1_000_000_000_000_000;
    const maxId = Number.MAX_SAFE_INTEGER;
    const nextEventId = Math.floor(Math.random() * (maxId - minId + 1)) + minId;

    if (!form.event_name.trim()) {
      setError("Please add a jam name.");
      setSubmitting(false);
      return;
    }

    if (!form.city.trim() || !form.region.trim()) {
      setError("Please include the city and region so others can find it.");
      setSubmitting(false);
      return;
    }

    const startTime = parseTimeToDb(form.start_time);
    const endTime = parseTimeToDb(form.end_time);
    if (startTime === undefined || endTime === undefined) {
      setError("Please use a valid time format (e.g., 19:00 or 7:00 PM).");
      setSubmitting(false);
      return;
    }

    const payload = {
      event_name: form.event_name.trim(),
      event_kind: nullIfEmpty(form.event_kind),
      primary_genre: nullIfEmpty(form.primary_genre),
      secondary_genres: nullIfEmpty(form.secondary_genres),
      skill_level: nullIfEmpty(form.skill_level),
      venue_name: nullIfEmpty(form.venue_name),
      address: nullIfEmpty(form.address),
      city: form.city.trim(),
      region: form.region.trim(),
      greater_region: nullIfEmpty(form.greater_region),
      state: nullIfEmpty(form.state),
      country: nullIfEmpty(form.country),
      latitude: toNumber(form.latitude),
      longitude: toNumber(form.longitude),
      day_of_week: nullIfEmpty(form.day_of_week),
      frequency: nullIfEmpty(form.frequency),
      weeks_of_month: nullIfEmpty(form.weeks_of_month),
      start_date: nullIfEmpty(form.start_date),
      end_date: nullIfEmpty(form.end_date),
      start_time: startTime ?? null,
      end_time: endTime ?? null,
      recurrence_description: nullIfEmpty(form.recurrence_description),
      avg_crowd_size: nullIfEmpty(form.avg_crowd_size),
      time_of_day: nullIfEmpty(form.time_of_day),
      invite_status: nullIfEmpty(form.invite_status),
      cover_charge_type: nullIfEmpty(form.cover_charge_type),
      cover_charge_amount: nullIfEmpty(form.cover_charge_amount),
      event_id: nextEventId,
      website_url: nullIfEmpty(form.website_url),
      facebook_url: nullIfEmpty(form.facebook_url),
      instagram_url: nullIfEmpty(form.instagram_url),
      other_links: nullIfEmpty(form.other_links),
      event_description: nullIfEmpty(form.event_description),
      contact_email: nullIfEmpty(form.contact_email),
      contact_phone: nullIfEmpty(form.contact_phone),
      trad_level: nullIfEmpty(form.trad_level),
      multiple_jams_at_once: form.multiple_jams_at_once,
      includes_dancing: form.includes_dancing,
      includes_visual_art: form.includes_visual_art,
      is_house_jam: form.is_house_jam,
      is_festival: form.is_festival,
      status: "active", // auto-publish
    };

    const { error: insertError, data } = await supabase
      .from("jams")
      .insert([payload])
      .select("id");

    if (insertError) {
      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    const newId = data?.[0]?.id;
    setSuccess(
      newId
        ? `Jam submitted! It is live now. View it at /jam/${newId}.`
        : "Jam submitted! It is live now."
    );
    setForm({ ...emptyForm });
    setSubmitting(false);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Submit a Jam</h1>
            <p className="text-sm text-slate-400">
              Add a jam to the map and calendar. Submissions publish
              immediately.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/"
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm hover:bg-slate-800"
            >
              ← Back to map
            </Link>
            <Link
              href="/calendar"
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm hover:bg-slate-800"
            >
              Calendar
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
              Basics
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm">
                Jam name *
                <input
                  value={form.event_name}
                  onChange={handleChange("event_name")}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  placeholder="Tuesday Night Jam"
                  required
                />
              </label>
              <label className="text-sm">
                Event kind
                <select
                  value={form.event_kind}
                  onChange={handleChange("event_kind")}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                >
                  <option value="">Select</option>
                  {EVENT_KIND_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Primary genre
                <select
                  value={form.primary_genre}
                  onChange={handleChange("primary_genre")}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                >
                  <option value="">Select</option>
                  {GENRE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Secondary genres
                <input
                  value={form.secondary_genres}
                  onChange={handleChange("secondary_genres")}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  placeholder="folk, swing"
                />
              </label>
              <label className="text-sm">
                Skill level
                <select
                  value={form.skill_level}
                  onChange={handleChange("skill_level")}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                >
                  <option value="">Select</option>
                  {SKILL_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
              Location
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm">
                Venue name
                <input
                  value={form.venue_name}
                  onChange={handleChange("venue_name")}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  placeholder="The Music Hall"
                />
              </label>
              <label className="text-sm">
                Address
                <input
                  value={form.address}
                  onChange={handleChange("address")}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  placeholder="123 Main St"
                />
              </label>
              <label className="text-sm">
                City *
                <input
                  value={form.city}
                  onChange={handleChange("city")}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  placeholder="Berkeley"
                  required
                />
              </label>
              <label className="text-sm">
                Region *
                <select
                  value={form.region}
                  onChange={handleChange("region")}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select</option>
                  {REGION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              </label>
              <label className="text-sm">
                Greater region
                <select
                  value={form.greater_region}
                  onChange={handleChange("greater_region")}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                >
                  <option value="">Select</option>
                  {GREATER_REGION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              </label>
              <label className="text-sm">
                State / Province
                <input
                  value={form.state}
                  onChange={handleChange("state")}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  placeholder="CA"
                />
              </label>
              <label className="text-sm">
                Country
                <input
                  value={form.country}
                  onChange={handleChange("country")}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  placeholder="USA"
                />
              </label>
              <label className="text-sm">
                Latitude
                <input
                  value={form.latitude}
                  onChange={handleChange("latitude")}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  placeholder="37.7749"
                  inputMode="decimal"
                />
              </label>
              <label className="text-sm">
                Longitude
                <input
                  value={form.longitude}
                  onChange={handleChange("longitude")}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  placeholder="-122.4194"
                  inputMode="decimal"
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
              Schedule
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm">
                Day of week
                <select
                  value={form.day_of_week}
                  onChange={handleChange("day_of_week")}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                >
                  <option value="">Select</option>
                  {DAY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Frequency
                <select
                  value={form.frequency}
                  onChange={handleChange("frequency")}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                >
                  <option value="">Select</option>
                  {FREQUENCY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Weeks of month (comma separated)
                <input
                  value={form.weeks_of_month}
                  onChange={handleChange("weeks_of_month")}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  placeholder="1,3"
                />
              </label>
              <label className="text-sm">
                Start date (YYYY-MM-DD)
                <input
                  type="date"
                  value={form.start_date}
                  onChange={handleChange("start_date")}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm">
                End date (YYYY-MM-DD)
                <input
                  type="date"
                  value={form.end_date}
                  onChange={handleChange("end_date")}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm">
                Start time
                <input
                  value={form.start_time}
                  onChange={handleChange("start_time")}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  placeholder="19:00 or 7:00 PM"
                />
              </label>
              <label className="text-sm">
                End time
                <input
                  value={form.end_time}
                  onChange={handleChange("end_time")}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  placeholder="22:30 or 10:30 PM"
                />
              </label>
              <label className="text-sm md:col-span-2">
                Recurrence description
                <input
                  value={form.recurrence_description}
                  onChange={handleChange("recurrence_description")}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  placeholder="Every Tuesday, 7–10pm (arrive by 6:30 to sign up)"
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.is_festival}
                  onChange={handleChange("is_festival")}
                />
                Festival spans multiple days
              </label>
              <label className="text-sm">
                Time of day
                <select
                  value={form.time_of_day}
                  onChange={handleChange("time_of_day")}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                >
                  <option value="">Select</option>
                  {TIME_OF_DAY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
              Access, vibe, and pricing
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm">
                Invite status
                <select
                  value={form.invite_status}
                  onChange={handleChange("invite_status")}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                >
                  <option value="">Select</option>
                  {INVITE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Crowd size
                <select
                  value={form.avg_crowd_size}
                  onChange={handleChange("avg_crowd_size")}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                >
                  <option value="">Select</option>
                  {CROWD_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Cover charge type
                <select
                  value={form.cover_charge_type}
                  onChange={handleChange("cover_charge_type")}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                >
                  <option value="">Select</option>
                  {COVER_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Cover charge amount / notes
                <input
                  value={form.cover_charge_amount}
                  onChange={handleChange("cover_charge_amount")}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  placeholder="$10 suggested, no one turned away"
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.is_house_jam}
                  onChange={handleChange("is_house_jam")}
                />
                House jam (private residence)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.includes_dancing}
                  onChange={handleChange("includes_dancing")}
                />
                Includes dancing
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.includes_visual_art}
                  onChange={handleChange("includes_visual_art")}
                />
                Includes visual art
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
              Format & Tradition
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm">
                How traditional is it?
                <input
                  value={form.trad_level}
                  onChange={handleChange("trad_level")}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  placeholder="Old-time focused, open to originals, etc."
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.multiple_jams_at_once}
                  onChange={handleChange("multiple_jams_at_once")}
                />
                Multiple jams happening at once
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
              Contact
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm">
                Contact email
                <input
                  type="email"
                  value={form.contact_email}
                  onChange={handleChange("contact_email")}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  placeholder="host@example.com"
                />
              </label>
              <label className="text-sm">
                Contact phone
                <input
                  value={form.contact_phone}
                  onChange={handleChange("contact_phone")}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  placeholder="(555) 123-4567"
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
              Links
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm">
                Website URL
                <input
                  value={form.website_url}
                  onChange={handleChange("website_url")}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  placeholder="https://example.com"
                />
              </label>
              <label className="text-sm">
                Facebook URL
                <input
                  value={form.facebook_url}
                  onChange={handleChange("facebook_url")}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  placeholder="https://facebook.com/..."
                />
              </label>
              <label className="text-sm">
                Instagram URL
                <input
                  value={form.instagram_url}
                  onChange={handleChange("instagram_url")}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  placeholder="https://instagram.com/..."
                />
              </label>
              <label className="text-sm">
                Other links
                <input
                  value={form.other_links}
                  onChange={handleChange("other_links")}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  placeholder="Any other URLs"
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
              Event Description
            </h2>
            <textarea
              value={form.event_description}
              onChange={handleChange("event_description")}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              rows={4}
              placeholder="Parking info, house rules, instruments available, etc."
            />
          </section>

          {error && (
            <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-md border border-green-500/40 bg-green-500/10 px-3 py-2 text-sm text-green-200">
              {success}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Publish jam"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
