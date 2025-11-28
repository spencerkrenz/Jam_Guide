
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { updateJam } from './actions'

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

    if (jam.owner_id !== user.id) {
        return <div>You are not authorized to edit this jam.</div>
    }

    return (
        <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
            <div className="mx-auto max-w-2xl">
                <h1 className="mb-6 text-2xl font-bold">Edit Jam: {jam.event_name}</h1>

                <form action={updateJam.bind(null, id)} className="space-y-6">
                    <div className="space-y-4 rounded-xl bg-slate-900/50 p-6 border border-slate-800">
                        <h2 className="text-lg font-semibold text-slate-200">Basic Info</h2>

                        <div>
                            <label className="block text-sm font-medium text-slate-300">Event Name</label>
                            <input
                                name="event_name"
                                defaultValue={jam.event_name || ''}
                                className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300">Venue Name</label>
                            <input
                                name="venue_name"
                                defaultValue={jam.venue_name || ''}
                                className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="space-y-4 rounded-xl bg-slate-900/50 p-6 border border-slate-800">
                        <h2 className="text-lg font-semibold text-slate-200">Location</h2>

                        <div>
                            <label className="block text-sm font-medium text-slate-300">Address</label>
                            <input
                                name="address"
                                defaultValue={jam.address || ''}
                                className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300">City</label>
                                <input
                                    name="city"
                                    defaultValue={jam.city || ''}
                                    className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300">State</label>
                                <input
                                    name="state"
                                    defaultValue={jam.state || ''}
                                    className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 rounded-xl bg-slate-900/50 p-6 border border-slate-800">
                        <h2 className="text-lg font-semibold text-slate-200">Timing</h2>

                        <div>
                            <label className="block text-sm font-medium text-slate-300">Day of Week</label>
                            <select
                                name="day_of_week"
                                defaultValue={jam.day_of_week || ''}
                                className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="">Select a day</option>
                                <option value="Monday">Monday</option>
                                <option value="Tuesday">Tuesday</option>
                                <option value="Wednesday">Wednesday</option>
                                <option value="Thursday">Thursday</option>
                                <option value="Friday">Friday</option>
                                <option value="Saturday">Saturday</option>
                                <option value="Sunday">Sunday</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300">Start Time</label>
                                <input
                                    type="time"
                                    name="start_time"
                                    defaultValue={jam.start_time || ''}
                                    className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300">End Time</label>
                                <input
                                    type="time"
                                    name="end_time"
                                    defaultValue={jam.end_time || ''}
                                    className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 rounded-xl bg-slate-900/50 p-6 border border-slate-800">
                        <h2 className="text-lg font-semibold text-slate-200">Details</h2>

                        <div>
                            <label className="block text-sm font-medium text-slate-300">Description</label>
                            <textarea
                                name="event_description"
                                rows={4}
                                defaultValue={jam.event_description || ''}
                                className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300">Website URL</label>
                            <input
                                type="url"
                                name="website_url"
                                defaultValue={jam.website_url || ''}
                                className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300">Contact Email</label>
                            <input
                                type="email"
                                name="contact_email"
                                defaultValue={jam.contact_email || ''}
                                className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <a
                            href={`/jam/${id}`}
                            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white"
                        >
                            Cancel
                        </a>
                        <button
                            type="submit"
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </main>
    )
}
