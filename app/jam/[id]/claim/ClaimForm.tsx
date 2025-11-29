'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function ClaimForm({ jamId, userId }: { jamId: number; userId: string }) {
    const [phone, setPhone] = useState('')
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.from('jam_claims').insert({
            jam_id: jamId,
            user_id: userId,
            phone_number: phone,
            notes: notes,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            router.push('/my-jams')
            router.refresh()
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-300">
                    Phone Number
                </label>
                <div className="mt-1">
                    <input
                        type="tel"
                        id="phone"
                        required
                        className="block w-full rounded-md border-slate-700 bg-slate-800 text-slate-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                        placeholder="(555) 123-4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                </div>
                <p className="mt-1 text-xs text-slate-400">
                    We'll use this to verify your claim.
                </p>
            </div>

            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-slate-300">
                    Additional Notes
                </label>
                <div className="mt-1">
                    <textarea
                        id="notes"
                        rows={4}
                        className="block w-full rounded-md border-slate-700 bg-slate-800 text-slate-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                        placeholder="Tell us about your relationship to this jam..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>
            </div>

            {error && (
                <div className="rounded-md bg-red-900/50 p-3 text-sm text-red-200">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50"
            >
                {loading ? 'Submitting...' : 'Submit Claim Request'}
            </button>
        </form>
    )
}
