
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import EditJamForm from './EditJamForm'

export default async function EditJamPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const resolved = await params
    const id = Number(resolved.id)

    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: jam, error } = await supabase
        .from('jams')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !jam) {
        return <div>Jam not found</div>
    }

    // Allow owner OR admin to edit
    // TODO: Centralize admin check
    const ADMIN_EMAILS = ["spencerkrenz@gmail.com", "spencer@jamguide.com", "spencer@jamguide.org"];
    const isAdmin = user.email && ADMIN_EMAILS.includes(user.email);

    if (jam.owner_id !== user.id && !isAdmin) {
        return <div>You are not authorized to edit this jam.</div>
    }

    return (
        <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
            <div className="mx-auto max-w-3xl">
                <h1 className="mb-6 text-2xl font-bold">Edit Jam: {jam.event_name}</h1>
                <EditJamForm jam={jam} />
            </div>
        </main>
    )
}
