'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addEvent(formData: FormData) {
  const supabase = await createClient()

  const company_id = formData.get('company_id') as string
  const title = formData.get('title') as string
  const type = formData.get('type') as string
  const start_time = formData.get('start_time') as string
  const end_time = formData.get('end_time') as string
  const location = formData.get('location') as string || null
  const description = formData.get('description') as string || null

  // end_timeがない場合はstart_time + 1時間とする等の処理
  const final_end_time = end_time || new Date(new Date(start_time).getTime() + 60 * 60 * 1000).toISOString()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // eventsテーブルに挿入
  const { data: event, error: eventError } = await supabase.from('events').insert({
    company_id: company_id || null,
    title,
    type,
    start_time: new Date(start_time).toISOString(),
    end_time: new Date(final_end_time).toISOString(),
    location,
    description
  }).select().single()

  if (eventError || !event) {
    throw new Error(`Failed to create event: ${eventError?.message}`)
  }

  // usereventsテーブルに挿入
  const { error: userEventError } = await supabase.from('userevents').insert({
    event_id: event.id,
    user_id: user.id,
    status: 'Attending'
  })

  if (userEventError) {
    throw new Error(`Failed to create user event: ${userEventError.message}`)
  }

  revalidatePath(`/companies/${company_id}`)
}

export async function deleteEvent(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  const company_id = formData.get('company_id') as string

  await supabase.from('events').delete().eq('id', id)

  revalidatePath(`/companies/${company_id}`)
}

