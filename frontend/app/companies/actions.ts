'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function addCompany(formData: FormData) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const name = formData.get('name') as string
  const url = formData.get('url') as string
  const status = formData.get('status') as string
  const motivation_level = parseInt(formData.get('motivation_level') as string)

  const { error } = await supabase.from('companies').insert({
    user_id: user.id,
    name,
    url,
    status,
    motivation_level,
  })

  if (error) {
    console.error('Error adding company:', error)
    // エラーハンドリングは適宜実装（今回は簡易的に）
    throw new Error('Failed to add company')
  }

  revalidatePath('/companies')
  redirect('/companies')
}

