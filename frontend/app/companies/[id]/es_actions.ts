'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addESEntry(formData: FormData) {
  const supabase = await createClient()

  const company_id = formData.get('company_id') as string
  const content = formData.get('content') as string
  const file_url = formData.get('file_url') as string || null
  const status = formData.get('status') as string || 'Draft'

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('es_entries').insert({
    user_id: user.id,
    company_id,
    content,
    file_url,
    status,
  })

  if (error) {
    console.error('ES creation error:', error)
    throw new Error('ESの作成に失敗しました')
  }

  revalidatePath(`/companies/${company_id}`)
}

export async function updateESEntry(formData: FormData) {
  const supabase = await createClient()

  const id = formData.get('id') as string
  const company_id = formData.get('company_id') as string
  const content = formData.get('content') as string
  const file_url = formData.get('file_url') as string || null
  const status = formData.get('status') as string
  const submitted_at = formData.get('submitted_at') as string || null

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('es_entries').update({
    content,
    file_url,
    status,
    submitted_at: submitted_at ? new Date(submitted_at).toISOString() : null,
    updated_at: new Date().toISOString()
  }).eq('id', id).eq('user_id', user.id)

  if (error) {
    console.error('ES update error:', error)
    throw new Error('ESの更新に失敗しました')
  }

  revalidatePath(`/companies/${company_id}`)
}

export async function deleteESEntry(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  const company_id = formData.get('company_id') as string

  await supabase.from('es_entries').delete().eq('id', id)
  revalidatePath(`/companies/${company_id}`)
}
