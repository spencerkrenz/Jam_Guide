
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateJam(id: number, formData: FormData) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    // Verify ownership
    const { data: jam } = await supabase
        .from('jams')
        .select('owner_id')
        .eq('id', id)
        .single()

    if (!jam || jam.owner_id !== user.id) {
        // TODO: Allow admin override
        throw new Error('Not authorized')
    }

    const updates = {
        event_name: formData.get('event_name') as string,
        venue_name: formData.get('venue_name') as string,
        address: formData.get('address') as string,
        city: formData.get('city') as string,
        state: formData.get('state') as string,
        day_of_week: formData.get('day_of_week') as string,
        start_time: formData.get('start_time') as string,
        end_time: formData.get('end_time') as string,
        event_description: formData.get('event_description') as string,
        website_url: formData.get('website_url') as string,
        contact_email: formData.get('contact_email') as string,
    }

    const { error } = await supabase.from('jams').update(updates).eq('id', id)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath(`/jam/${id}`)
    redirect(`/jam/${id}`)
}
