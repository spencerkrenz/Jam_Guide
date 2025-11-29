import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function MyJamsPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: jams } = await supabase
        .from("jams")
        .select("*")
        .eq("owner_id", user.id);

    const { data: claims } = await supabase
        .from("jam_claims")
        .select("*, jams(*)")
        .eq("user_id", user.id);

    return (
        <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
            <div className="mx-auto max-w-4xl">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-3xl font-bold">My Jams</h1>
                    <Link
                        href="/"
                        className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium hover:bg-slate-700"
                    >
                        Back to Map
                    </Link>
                </div>

                <div className="space-y-8">
                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-blue-400">
                            Jams I Host (Approved)
                        </h2>
                        {jams && jams.length > 0 ? (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {jams.map((jam) => (
                                    <div
                                        key={jam.id}
                                        className="rounded-lg border border-slate-800 bg-slate-900 p-6"
                                    >
                                        <h3 className="mb-2 text-lg font-bold">{jam.event_name}</h3>
                                        <p className="mb-4 text-sm text-slate-400">
                                            {jam.city} • {jam.day_of_week}s
                                        </p>
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/jam/${jam.id}/edit`}
                                                className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500"
                                            >
                                                Edit Details
                                            </Link>
                                            <Link
                                                href={`/jam/${jam.id}`}
                                                className="rounded-md bg-slate-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-600"
                                            >
                                                View Page
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400">
                                You haven't been assigned as the host for any jams yet.
                            </p>
                        )}
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-yellow-400">
                            Pending Claims
                        </h2>
                        {claims && claims.length > 0 ? (
                            <div className="space-y-4">
                                {claims.map((claim) => (
                                    <div
                                        key={claim.id}
                                        className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 p-4"
                                    >
                                        <div>
                                            <h3 className="font-medium">
                                                {claim.jams?.event_name || "Unknown Jam"}
                                            </h3>
                                            <p className="text-sm text-slate-400">
                                                Status: <span className="capitalize">{claim.status}</span>
                                            </p>
                                        </div>
                                        <span className="text-xs text-slate-500">
                                            {new Date(claim.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400">No pending claims.</p>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
