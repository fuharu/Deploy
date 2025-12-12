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
  const location = formData.get('location') as string

  // end_timeがない場合はstart_time + 1時間とする等の処理
  const final_end_time = end_time || new Date(new Date(start_time).getTime() + 60*60*1000).toISOString()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase.from('events').insert({
    user_id: user.id,
    company_id: company_id || null,
    title,
    type,
    start_time: new Date(start_time).toISOString(),
    end_time: new Date(final_end_time).toISOString(),
    location
  })

  revalidatePath(`/companies/${company_id}`)
}

export async function deleteEvent(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  const company_id = formData.get('company_id') as string

  await supabase.from('events').delete().eq('id', id)
  
  revalidatePath(`/companies/${company_id}`)
}

