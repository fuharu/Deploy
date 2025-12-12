'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addESEntry(formData: FormData) {
  const supabase = await createClient()
  
  const company_id = formData.get('company_id') as string
  const question = formData.get('question') as string
  const max_chars = formData.get('max_chars') ? parseInt(formData.get('max_chars') as string) : null
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase.from('es_entries').insert({
    user_id: user.id,
    company_id,
    question,
    max_chars,
    status: 'Draft'
  })

  revalidatePath(`/companies/${company_id}`)
}

export async function updateESEntry(formData: FormData) {
  const supabase = await createClient()

  const id = formData.get('id') as string
  const company_id = formData.get('company_id') as string
  const answer = formData.get('answer') as string
  const status = formData.get('status') as string // 'Draft' or 'Completed'

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase.from('es_entries').update({
    answer,
    status,
    updated_at: new Date().toISOString()
  }).eq('id', id)

  revalidatePath(`/companies/${company_id}`)
}

export async function deleteESEntry(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  const company_id = formData.get('company_id') as string

  await supabase.from('es_entries').delete().eq('id', id)
  revalidatePath(`/companies/${company_id}`)
}

