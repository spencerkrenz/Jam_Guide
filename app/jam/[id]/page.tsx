// app/jam/[id]/page.tsx

import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import ReviewsSection from "./ReviewsSection";
import { redirect } from "next/navigation";

type Jam = {
  id: number;
  event_id: number | null;
  owner_id: string | null; // Added owner_id

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
  greater_region: string | null;
  latitude: number | null;
  longitude: number | null;

  day_of_week: string | null;
  start_time: string | null;
  end_time: string | null;
  recurrence_description: string | null;
  frequency: string | null;
  weeks_of_month: string | null;
  start_date: string | null;
  end_date: string | null;
  avg_crowd_size: string | null;
  time_of_day: string | null;

  website_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  other_links: string | null;
  contact_email: string | null;
  contact_phone: string | null;

  includes_dancing: boolean | null;
  includes_visual_art: boolean | null;
  is_house_jam: boolean | null;
  is_festival: boolean | null;
  multiple_jams_at_once: boolean | null;
  trad_level: string | null;
  invite_status: string | null;
  cover_charge_type: string | null;
  cover_charge_amount: string | null;

  event_description: string | null;
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

  const supabase = await createClient();
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

  // Check current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isOwner = user && jam.owner_id === user.id;
  // TODO: Add admin check here if you have an admin role or specific email
  // const isAdmin = user?.email === 'admin@example.com'; 

  const mapsUrl = buildMapsUrl(jam);
  const start = formatTime(jam.start_time);
  const end = formatTime(jam.end_time);
  const timeRange = start && end ? `${start}–${end}` : start || "";
  const jamDisplayName = jam.event_name || jam.venue_name || "this jam";

  const genreTags = [jam.primary_genre, jam.secondary_genres]
    .filter(Boolean)
    .join(" • ");

  const hasContact = jam.contact_email || jam.contact_phone;
  const hasLinks =
    jam.website_url || jam.facebook_url || jam.instagram_url || jam.other_links;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Back link */}
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-slate-300 hover:underline"
          >
            ← Back to map
          </Link>
          {!user && (
            <Link
              href="/login"
              className="text-sm font-medium text-blue-400 hover:text-blue-300"
            >
              Log in / Sign up
            </Link>
          )}
          {user && (
            <div className="text-sm text-slate-400">
              Logged in as {user.email}
            </div>
          )}
        </div>

        {/* Top info card */}
        <section className="mb-6 rounded-2xl bg-slate-900/80 p-5 shadow relative overflow-hidden">
          {isOwner && (
            <div className="absolute top-4 right-4 z-10">
              <Link
                href={`/jam/${jam.id}/edit`}
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-blue-500 transition-colors"
              >
                Edit Jam
              </Link>
            </div>
          )}

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

          <h1 className="mb-2 text-2xl font-bold pr-24">
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

          {(jam.avg_crowd_size ||
            jam.invite_status ||
            jam.cover_charge_type ||
            jam.cover_charge_amount) && (
              <div className="mt-4 grid gap-2 text-xs text-slate-300 md:grid-cols-3">
                {jam.invite_status && (
                  <div>
                    <div className="font-semibold text-slate-200">Access</div>
                    <div className="text-slate-400">{jam.invite_status}</div>
                  </div>
                )}
                {(jam.cover_charge_type || jam.cover_charge_amount) && (
                  <div>
                    <div className="font-semibold text-slate-200">Cover</div>
                    <div className="text-slate-400">
                      {[jam.cover_charge_type, jam.cover_charge_amount]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  </div>
                )}
                {jam.avg_crowd_size && (
                  <div>
                    <div className="font-semibold text-slate-200">Crowd</div>
                    <div className="text-slate-400">{jam.avg_crowd_size}</div>
                  </div>
                )}
              </div>
            )}
        </section>

        {/* Description (formerly Notes) */}
        {jam.event_description && (
          <section className="mb-6 rounded-2xl bg-slate-900/60 p-4">
            <h2 className="mb-2 text-sm font-semibold text-slate-200">
              Description
            </h2>
            <p className="text-sm text-slate-300">{jam.event_description}</p>
          </section>
        )}

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

        {/* Format & tradition */}
        {(jam.trad_level ||
          jam.time_of_day ||
          jam.is_house_jam ||
          jam.is_festival ||
          jam.includes_dancing ||
          jam.includes_visual_art ||
          jam.multiple_jams_at_once) && (
            <section className="mb-6 rounded-2xl bg-slate-900/60 p-4">
              <h2 className="mb-3 text-sm font-semibold text-slate-200">
                Format & Tradition
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {jam.trad_level && (
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      How traditional
                    </div>
                    <div className="text-sm text-slate-100">
                      {jam.trad_level}
                    </div>
                  </div>
                )}
                {jam.time_of_day && (
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      Time of day
                    </div>
                    <div className="text-sm text-slate-100">{jam.time_of_day}</div>
                  </div>
                )}
                {jam.includes_dancing && (
                  <div className="text-sm text-slate-100">
                    Includes dancing
                  </div>
                )}
                {jam.includes_visual_art && (
                  <div className="text-sm text-slate-100">
                    Includes visual art
                  </div>
                )}
                {jam.is_house_jam && (
                  <div className="text-sm text-slate-100">House jam</div>
                )}
                {jam.is_festival && (
                  <div className="text-sm text-slate-100">Festival spans days</div>
                )}
                {jam.multiple_jams_at_once && (
                  <div className="text-sm text-slate-100">
                    Multiple jams at once
                  </div>
                )}
              </div>
            </section>
          )}

        <ReviewsSection jamId={jam.id} jamName={jamDisplayName} />

        {/* Contact & links */}
        {(hasContact || hasLinks) && (
          <section className="mb-6 rounded-2xl bg-slate-900/60 p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-200">
              Contact & Links
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {hasContact && (
                <div className="space-y-2 text-sm">
                  {jam.contact_email && (
                    <div>
                      <span className="text-slate-400">Email: </span>
                      <a
                        href={`mailto:${jam.contact_email}`}
                        className="text-blue-400 hover:underline"
                      >
                        {jam.contact_email}
                      </a>
                    </div>
                  )}
                  {jam.contact_phone && (
                    <div>
                      <span className="text-slate-400">Phone: </span>
                      <a
                        href={`tel:${jam.contact_phone}`}
                        className="text-blue-400 hover:underline"
                      >
                        {jam.contact_phone}
                      </a>
                    </div>
                  )}
                </div>
              )}

              {hasLinks && (
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
                    <div className="text-xs text-slate-300">
                      {jam.other_links}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}


        {/* Request to Claim Jam As Host */}
        {!isOwner && (
          <section className="mb-6 rounded-2xl bg-slate-900/60 p-4">
            <h2 className="mb-2 text-sm font-semibold text-slate-200">
              Is this your jam?
            </h2>
            <p className="mb-4 text-sm text-slate-300">
              Claim this jam to manage its details and keep the community updated.
            </p>
            {user ? (
              <a
                href={`mailto:hello@jamguide.com?subject=Claim Request: ${encodeURIComponent(jamDisplayName)} (ID: ${jam.id})&body=I would like to claim this jam. My user email is ${user.email}.`}
                className="inline-block rounded-full border border-slate-700 bg-slate-800 px-5 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
              >
                Request to Claim
              </a>
            ) : (
              <Link
                href={`/login?next=/jam/${jam.id}`}
                className="inline-block rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
              >
                Log in to Claim
              </Link>
            )}
          </section>
        )}

      </div>
    </main>
  );
}
