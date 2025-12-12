'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addTask(formData: FormData) {
  const supabase = await createClient()
  
  const company_id = formData.get('company_id') as string
  const title = formData.get('title') as string
  const due_date = formData.get('due_date') as string || null
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase.from('tasks').insert({
    user_id: user.id,
    company_id: company_id || null,
    title,
    due_date,
    is_completed: false
  })

  if (company_id) {
    revalidatePath(`/companies/${company_id}`)
  } else {
    revalidatePath('/dashboard') // 仮
  }
}

export async function toggleTask(id: string, is_completed: boolean, company_id: string | null) {
  const supabase = await createClient()
  
  await supabase.from('tasks').update({
    is_completed
  }).eq('id', id)

  if (company_id) {
    revalidatePath(`/companies/${company_id}`)
  } else {
    revalidatePath('/dashboard')
  }
}

export async function deleteTask(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  const company_id = formData.get('company_id') as string

  await supabase.from('tasks').delete().eq('id', id)
  
  if (company_id) {
    revalidatePath(`/companies/${company_id}`)
  } else {
    revalidatePath('/dashboard')
  }
}

