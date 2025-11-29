'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ClaimActionButtons({ claimId, jamId, userId }: { claimId: string, jamId: number, userId: string }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleApprove = async () => {
        if (!confirm('Are you sure you want to approve this claim? This will make the user the owner of the jam.')) return

        setLoading(true)

        // 1. Update the claim status
        const { error: claimError } = await supabase
            .from('jam_claims')
            .update({ status: 'approved' })
            .eq('id', claimId)

        if (claimError) {
            alert('Error updating claim: ' + claimError.message)
            setLoading(false)
            return
        }

        // 2. Update the jam owner
        // NOTE: This requires an RLS policy that allows the admin to update jams!
        const { error: jamError } = await supabase
            .from('jams')
            .update({ owner_id: userId })
            .eq('id', jamId)

        if (jamError) {
            alert('Error updating jam owner: ' + jamError.message)
            // revert claim status?
            setLoading(false)
            return
        }

        router.refresh()
        setLoading(false)
    }

    const handleReject = async () => {
        if (!confirm('Reject this claim?')) return

        setLoading(true)
        const { error } = await supabase
            .from('jam_claims')
            .update({ status: 'rejected' })
            .eq('id', claimId)

        if (error) {
            alert('Error rejecting claim: ' + error.message)
        } else {
            router.refresh()
        }
        setLoading(false)
    }

    return (
        <div className="flex gap-2">
            <button
                onClick={handleApprove}
                disabled={loading}
                className="rounded bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-500 disabled:opacity-50"
            >
                Approve
            </button>
            <button
                onClick={handleReject}
                disabled={loading}
                className="rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-50"
            >
                Reject
            </button>
        </div>
    )
}
