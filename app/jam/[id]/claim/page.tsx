import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ClaimForm from "./ClaimForm";

export default async function ClaimPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = await params;
    const idNum = Number(resolvedParams.id);

    if (!Number.isFinite(idNum)) {
        return <div>Invalid Jam ID</div>;
    }

    const supabase = await createClient();

    // Check auth
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/login?next=/jam/${idNum}/claim`);
    }

    // Fetch jam details
    const { data: jam } = await supabase
        .from("jams")
        .select("event_name, id")
        .eq("id", idNum)
        .single();

    if (!jam) {
        return <div>Jam not found</div>;
    }

    return (
        <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100">
            <div className="mx-auto max-w-lg rounded-2xl bg-slate-900/80 p-8 shadow-xl border border-slate-800">
                <div className="mb-6">
                    <Link
                        href={`/jam/${idNum}`}
                        className="text-sm text-slate-400 hover:text-slate-300"
                    >
                        ← Back to Jam
                    </Link>
                    <h1 className="mt-4 text-2xl font-bold">Claim "{jam.event_name}"</h1>
                    <p className="mt-2 text-slate-400">
                        Submit a request to manage this jam. We'll review it and get back to you.
                    </p>
                </div>

                <ClaimForm jamId={jam.id} userId={user.id} />
            </div>
        </main>
    );
}
