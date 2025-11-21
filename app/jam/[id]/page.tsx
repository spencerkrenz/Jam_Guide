// app/jam/[id]/page.tsx

import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

type Jam = {
  id: number;
  event_id: number | null;

  event_name: string | null;
  event_kind: string | null;
  primary_genre: string | null;
  secondary_genres: string | null;
  skill_level: string | null;

  venue_name: string | null;
  address: string | null;
  city: string | null;
  region: string | null;
  state: string | null;
  country: string | null;

  day_of_week: string | null;
  start_time: string | null;
  end_time: string | null;
  recurrence_description: string | null;
  frequency: string | null;
  avg_crowd_size: string | null;

  website_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  other_links: string | null;

  includes_dancing: boolean | null;
  includes_visual_art: boolean | null;

  notes: string | null;
};

function formatTime(t: string | null): string {
  if (!t) return "";
  return t.slice(0, 5); // "19:00:00" -> "19:00"
}

function buildMapsUrl(jam: Jam): string | null {
  const parts = [
    jam.venue_name,
    jam.address,
    jam.city,
    jam.state,
    jam.country,
  ].filter(Boolean);

  if (parts.length === 0) return null;

  const query = encodeURIComponent(parts.join(", "));
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export default async function JamDetailPage({
  params,
}: {
  // NOTE: in Next 16, params is a Promise
  params: Promise<{ id: string }>;
}) {
  // Unwrap the params Promise
  const resolved = await params;
  const rawId = resolved.id;

  const idNum = Number(rawId);

  if (!Number.isFinite(idNum)) {
    console.error("JamDetailPage: non-numeric id param:", rawId);
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
        <div className="mb-4">
          <Link
            href="/"
            className="text-sm text-slate-300 hover:underline"
          >
            ← Back to map
          </Link>
        </div>
        <p>Jam not found.</p>
      </main>
    );
  }

  console.log("JamDetailPage: loading jam with id =", idNum);

  const { data, error } = await supabase
    .from("jams")
    .select("*")
    .eq("id", idNum)
    .single();

  if (error || !data) {
    console.error("Error loading jam by id:", error?.message, "for id:", idNum);
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
        <div className="mb-4">
          <Link
            href="/"
            className="text-sm text-slate-300 hover:underline"
          >
            ← Back to map
          </Link>
        </div>
        <p>Jam not found.</p>
      </main>
    );
  }

  const jam = data as Jam;

  const mapsUrl = buildMapsUrl(jam);
  const start = formatTime(jam.start_time);
  const end = formatTime(jam.end_time);
  const timeRange = start && end ? `${start}–${end}` : start || "";

  const genreTags = [jam.primary_genre, jam.secondary_genres]
    .filter(Boolean)
    .join(" • ");

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Back link */}
        <div className="mb-4">
          <Link
            href="/"
            className="text-sm text-slate-300 hover:underline"
          >
            ← Back to map
          </Link>
        </div>

        {/* Top info card */}
        <section className="mb-6 rounded-2xl bg-slate-900/80 p-5 shadow">
          <div className="mb-3 flex flex-wrap gap-2">
            {jam.primary_genre && (
              <span className="rounded-full bg-blue-600/80 px-3 py-1 text-xs font-semibold">
                {jam.primary_genre}
              </span>
            )}
            {jam.skill_level && (
              <span className="rounded-full bg-slate-700/80 px-3 py-1 text-xs font-semibold">
                {jam.skill_level}
              </span>
            )}
            {jam.event_kind && (
              <span className="rounded-full bg-slate-800/80 px-3 py-1 text-xs text-slate-200">
                {jam.event_kind}
              </span>
            )}
          </div>

          <h1 className="mb-2 text-2xl font-bold">
            {jam.event_name || "Untitled jam"}
          </h1>

          <div className="space-y-1 text-sm text-slate-200">
            {jam.venue_name && (
              <div className="font-semibold">{jam.venue_name}</div>
            )}
            <div>
              {[jam.address, jam.city, jam.state, jam.region]
                .filter(Boolean)
                .join(", ")}
            </div>
            <div className="text-xs text-slate-400">
              {[jam.city, jam.region].filter(Boolean).join(", ")}
            </div>
          </div>

          {mapsUrl && (
            <div className="mt-2 text-sm">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:underline"
              >
                Open in Maps
              </a>
            </div>
          )}

          <div className="mt-4 space-y-1 text-sm text-slate-200">
            <div>
              {jam.day_of_week && (
                <span className="font-semibold">{jam.day_of_week}</span>
              )}
              {timeRange && <span className="ml-2">{timeRange}</span>}
            </div>
            {jam.recurrence_description && (
              <div className="text-xs text-slate-400">
                {jam.recurrence_description}
              </div>
            )}
            {jam.avg_crowd_size && (
              <div className="text-xs text-slate-400">
                Crowd: {jam.avg_crowd_size}
              </div>
            )}
          </div>

          {genreTags && (
            <div className="mt-3 text-xs text-slate-400">{genreTags}</div>
          )}
        </section>

        {/* Attendance / verification strip – placeholders */}
        <section className="mb-6 rounded-2xl bg-slate-900/60 p-4 text-sm">
          <p className="mb-3 text-slate-300">
            No recent confirmations — verify before you go.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-full border border-slate-700 bg-slate-950 px-4 py-1 text-sm text-slate-100 hover:bg-slate-800"
              disabled
            >
              I attended (coming soon)
            </button>
            <button
              type="button"
              className="rounded-full border border-slate-700 bg-slate-950 px-4 py-1 text-sm text-slate-100 hover:bg-slate-800"
              disabled
            >
              It wasn&apos;t happening (coming soon)
            </button>
          </div>
        </section>

        {/* Ratings summary – placeholders */}
        <section className="mb-6 rounded-2xl bg-slate-900/60 p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-200">
            Community Ratings
          </h2>

          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div>
              <div className="text-2xl font-bold">–</div>
              <div className="text-xs text-slate-400">Overall</div>
            </div>
            <div>
              <div className="text-lg font-semibold">–</div>
              <div className="text-xs text-slate-400">Networking</div>
            </div>
            <div>
              <div className="text-lg font-semibold">–</div>
              <div className="text-xs text-slate-400">Info accuracy</div>
            </div>
            <div>
              <div className="text-lg font-semibold">0</div>
              <div className="text-xs text-slate-400">Recent check-ins</div>
            </div>
          </div>
        </section>

        {/* Reviews – placeholder */}
        <section className="mb-6 rounded-2xl bg-slate-900/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200">Reviews</h2>
            <button
              type="button"
              className="rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-500"
              disabled
            >
              Add Review (coming soon)
            </button>
          </div>

          <p className="text-sm text-slate-400">
            No reviews yet. Once reviews are enabled, they&apos;ll show up here.
          </p>
        </section>

        {/* Contact & links */}
        <section className="mb-6 rounded-2xl bg-slate-900/60 p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-200">
            Contact & Links
          </h2>
          <div className="space-y-2 text-sm">
            {jam.website_url && (
              <div>
                <a
                  href={jam.website_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  Website
                </a>
              </div>
            )}
            {jam.facebook_url && (
              <div>
                <a
                  href={jam.facebook_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  Facebook
                </a>
              </div>
            )}
            {jam.instagram_url && (
              <div>
                <a
                  href={jam.instagram_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  Instagram
                </a>
              </div>
            )}
            {jam.other_links && (
              <div className="text-xs text-slate-300">{jam.other_links}</div>
            )}
            {!jam.website_url &&
              !jam.facebook_url &&
              !jam.instagram_url &&
              !jam.other_links && (
                <div className="text-xs text-slate-500">
                  No links provided yet.
                </div>
              )}
          </div>
        </section>

        {/* Notes */}
        {jam.notes && (
          <section className="mb-6 rounded-2xl bg-slate-900/60 p-4">
            <h2 className="mb-2 text-sm font-semibold text-slate-200">
              Notes
            </h2>
            <p className="text-sm text-slate-300">{jam.notes}</p>
          </section>
        )}
      </div>
    </main>
  );
}
