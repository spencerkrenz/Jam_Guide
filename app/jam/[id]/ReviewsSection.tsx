"use client";

import { supabase } from "@/lib/supabaseClient";
import { FormEvent, useEffect, useMemo, useState } from "react";

type JamReview = {
  id: number;
  jam_id: number;
  created_at: string | null;
  display_name: string | null;
  comments: string | null;
  overall_rating: number | null;
  networking_rating: number | null;
  info_accuracy_rating: number | null;
  happened: boolean | null;
};

type FormState = {
  displayName: string;
  comments: string;
  overallRating: number;
  networkingRating: number;
  infoAccuracyRating: number;
  happened: "yes" | "no" | "unknown";
};

const initialForm: FormState = {
  displayName: "",
  comments: "",
  overallRating: 4,
  networkingRating: 4,
  infoAccuracyRating: 4,
  happened: "yes",
};

function average(values: (number | null | undefined)[]): number | null {
  const nums = values.filter((v): v is number => typeof v === "number");
  if (nums.length === 0) return null;
  const sum = nums.reduce((acc, val) => acc + val, 0);
  return sum / nums.length;
}

function formatRating(value: number | null): string {
  if (value === null) return "--";
  return value.toFixed(1);
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function happenedLabel(flag: boolean | null): string {
  if (flag === true) return "Happening recently";
  if (flag === false) return "Reported not happening";
  return "Status unknown";
}

export default function ReviewsSection({
  jamId,
  jamName,
}: {
  jamId: number;
  jamName?: string | null;
}) {
  const [reviews, setReviews] = useState<JamReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("jam_reviews")
        .select(
          "id, jam_id, created_at, display_name, comments, overall_rating, networking_rating, info_accuracy_rating, happened",
        )
        .eq("jam_id", jamId)
        .order("created_at", { ascending: false });

      if (!active) return;

      if (error) {
        const friendly = error.message?.includes("schema cache")
          ? "Reviews are not set up yet. Create the 'jam_reviews' table to enable them."
          : "Could not load reviews right now.";
        setError(friendly);
        setReviews([]);
      } else {
        setReviews((data as JamReview[]) ?? []);
      }

      setLoading(false);
    }

    load();

    return () => {
      active = false;
    };
  }, [jamId]);

  const stats = useMemo(() => {
    const overall = average(reviews.map((r) => r.overall_rating));
    const networking = average(reviews.map((r) => r.networking_rating));
    const accuracy = average(reviews.map((r) => r.info_accuracy_rating));
    const checkins = reviews.filter((r) => r.happened === true).length;
    const negativeCheckins = reviews.filter((r) => r.happened === false).length;

    return { overall, networking, accuracy, checkins, negativeCheckins };
  }, [reviews]);

  const handleSubmit = async (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    setSubmitError(null);
    setSubmitting(true);

    const happenedValue =
      form.happened === "yes"
        ? true
        : form.happened === "no"
          ? false
          : null;

    const payload = {
      jam_id: jamId,
      overall_rating: form.overallRating,
      networking_rating: form.networkingRating,
      info_accuracy_rating: form.infoAccuracyRating,
      happened: happenedValue,
      comments: form.comments.trim() || null,
      display_name: form.displayName.trim() || null,
    };

    const { data, error } = await supabase
      .from("jam_reviews")
      .insert(payload)
      .select()
      .single();

    if (error) {
      const friendly = error.message?.includes("schema cache")
        ? "Reviews table not found yet. Create a 'jam_reviews' table with the expected columns."
        : "Could not save your review. Please try again.";
      setSubmitError(friendly);
      setSubmitting(false);
      return;
    }

    const newReview = Array.isArray(data) ? data[0] : data;
    setReviews((prev) => [newReview as JamReview, ...prev]);
    setForm(initialForm);
    setSubmitting(false);
  };

  const jamLabel = jamName || "this jam";

  return (
    <section className="mb-6 rounded-2xl bg-slate-900/60 p-4">
      <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-200">
            Reviews & Ratings
          </h2>
          <p className="text-xs text-slate-400">
            Community feedback for {jamLabel}.
          </p>
        </div>
        {error && (
          <span className="rounded-md bg-red-900/50 px-2 py-1 text-xs text-red-200">
            {error}
          </span>
        )}
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4 text-sm md:grid-cols-5">
        <div>
          <div className="text-2xl font-bold">{formatRating(stats.overall)}</div>
          <div className="text-xs text-slate-400">Overall</div>
        </div>
        <div>
          <div className="text-lg font-semibold">
            {formatRating(stats.networking)}
          </div>
          <div className="text-xs text-slate-400">Networking</div>
        </div>
        <div>
          <div className="text-lg font-semibold">
            {formatRating(stats.accuracy)}
          </div>
          <div className="text-xs text-slate-400">Info accuracy</div>
        </div>
        <div>
          <div className="text-lg font-semibold">{stats.checkins}</div>
          <div className="text-xs text-slate-400">Confirmed check-ins</div>
        </div>
        <div>
          <div className="text-lg font-semibold">
            {stats.negativeCheckins}
          </div>
          <div className="text-xs text-slate-400">Reported off-nights</div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="space-y-3 rounded-xl bg-slate-950/40 p-3 lg:col-span-3">
          {loading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-4 rounded bg-slate-800/70" />
              <div className="h-4 rounded bg-slate-800/70" />
              <div className="h-4 rounded bg-slate-800/70" />
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-slate-400">
              No reviews yet. Be the first to add details about your experience.
            </p>
          ) : (
            reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-lg border border-slate-800 bg-slate-900/60 p-3"
              >
                <div className="mb-1 flex items-center justify-between text-sm">
                  <div className="font-semibold text-slate-100">
                    {review.display_name || "Anonymous"}
                  </div>
                  <div className="text-xs text-slate-500">
                    {formatDate(review.created_at)}
                  </div>
                </div>
                <div className="mb-2 flex flex-wrap gap-3 text-xs text-slate-300">
                  {review.overall_rating !== null && (
                    <span>Overall: {review.overall_rating}/5</span>
                  )}
                  {review.networking_rating !== null && (
                    <span>Networking: {review.networking_rating}/5</span>
                  )}
                  {review.info_accuracy_rating !== null && (
                    <span>Accuracy: {review.info_accuracy_rating}/5</span>
                  )}
                  {review.happened !== null && (
                    <span className="text-slate-400">
                      {happenedLabel(review.happened)}
                    </span>
                  )}
                </div>
                {review.comments && (
                  <p className="text-sm text-slate-100">{review.comments}</p>
                )}
              </div>
            ))
          )}
        </div>

        <div className="rounded-xl bg-slate-950/40 p-3 lg:col-span-2">
          <h3 className="mb-2 text-sm font-semibold text-slate-200">
            Share your experience
          </h3>
          <form className="space-y-3 text-sm" onSubmit={handleSubmit}>
            <div className="grid gap-2 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs text-slate-400">Overall</span>
                <select
                  className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2"
                  value={form.overallRating}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      overallRating: Number(e.target.value),
                    }))
                  }
                >
                  {[5, 4, 3, 2, 1].map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-xs text-slate-400">Networking</span>
                <select
                  className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2"
                  value={form.networkingRating}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      networkingRating: Number(e.target.value),
                    }))
                  }
                >
                  {[5, 4, 3, 2, 1].map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-xs text-slate-400">Info accuracy</span>
                <select
                  className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2"
                  value={form.infoAccuracyRating}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      infoAccuracyRating: Number(e.target.value),
                    }))
                  }
                >
                  {[5, 4, 3, 2, 1].map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-xs text-slate-400">
                  Was it happening?
                </span>
                <select
                  className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2"
                  value={form.happened}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      happened: e.target.value as FormState["happened"],
                    }))
                  }
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="unknown">Not sure</option>
                </select>
              </label>
            </div>

            <label className="space-y-1">
              <span className="text-xs text-slate-400">Name (optional)</span>
              <input
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2"
                placeholder="Add your name"
                value={form.displayName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, displayName: e.target.value }))
                }
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs text-slate-400">Notes</span>
              <textarea
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2"
                rows={4}
                placeholder={`What was it like at ${jamLabel}?`}
                value={form.comments}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, comments: e.target.value }))
                }
              />
            </label>

            {submitError && (
              <p className="text-xs text-red-300">{submitError}</p>
            )}

            <button
              type="submit"
              className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Add review"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
