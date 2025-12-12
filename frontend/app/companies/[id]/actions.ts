'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function deleteCompany(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  const { error } = await supabase
    .from('companies')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting company:', error)
    throw new Error('Failed to delete company')
  }

  revalidatePath('/companies')
  redirect('/companies')
}

// updateCompany is similar to addCompany but with update()
export async function updateCompany(formData: FormData) {
    const supabase = await createClient()
    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const url = formData.get('url') as string
    const status = formData.get('status') as string
    const motivation_level = parseInt(formData.get('motivation_level') as string)

    const { error } = await supabase
      .from('companies')
      .update({ name, url, status, motivation_level })
      .eq('id', id)
    
    if (error) {
        console.error('Error updating company:', error)
        throw new Error('Failed to update company')
    }

    revalidatePath(`/companies/${id}`)
    revalidatePath('/companies')
    redirect(`/companies/${id}`)
}

