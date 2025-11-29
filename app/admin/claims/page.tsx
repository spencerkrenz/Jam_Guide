import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ClaimActionButtons from "./ClaimActionButtons";

export default async function AdminClaimsPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // TODO: Replace with your actual email or a more robust role check
    const ADMIN_EMAILS = ["spencerkrenz@gmail.com", "spencer@jamguide.org"];
    if (!user.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
        return (
            <div className="p-8 text-center text-slate-400">
                <h1 className="text-xl font-bold text-white">Access Denied</h1>
                <p>You do not have permission to view this page.</p>
                <p className="mt-4 text-sm">Current User: {user.email}</p>
            </div>
        );
    }

    const { data: claims } = await supabase
        .from("jam_claims")
        .select("*, jams(event_name)")
        .order("created_at", { ascending: false });

    // To get user emails, we might need a separate admin function or a view. 
    // For now, we'll just list the User ID.

    return (
        <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
            <div className="mx-auto max-w-6xl">
                <h1 className="mb-8 text-3xl font-bold">Admin: Jam Claims</h1>

                <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
                    <table className="min-w-full divide-y divide-slate-800">
                        <thead className="bg-slate-950/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                                    Jam
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                                    User ID / Phone
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                                    Notes
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {claims?.map((claim) => (
                                <tr key={claim.id}>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="text-sm font-medium text-white">
                                            {claim.jams?.event_name || "Unknown Jam"}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            ID: {claim.jam_id}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-300">
                                            {claim.phone_number || "No phone"}
                                        </div>
                                        <div className="text-xs text-slate-500 font-mono">
                                            {claim.user_id}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-300 max-w-xs truncate">
                                            {claim.notes}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <span
                                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${claim.status === "approved"
                                                ? "bg-green-900 text-green-200"
                                                : claim.status === "rejected"
                                                    ? "bg-red-900 text-red-200"
                                                    : "bg-yellow-900 text-yellow-200"
                                                }`}
                                        >
                                            {claim.status}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        {claim.status === "pending" && (
                                            <ClaimActionButtons
                                                claimId={claim.id}
                                                jamId={claim.jam_id}
                                                userId={claim.user_id}
                                            />
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
