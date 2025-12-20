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

  // 0. public.users にユーザーが存在するか確認し、なければ作成
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!existingUser) {
    // public.users にレコードを作成
    // name と university は必須なので、デフォルト値を設定
    const { error: userCreateError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.user_metadata?.full_name || 'ユーザー',
        university: user.user_metadata?.university || '未設定',
      })

    if (userCreateError) {
      console.error('Error creating user in public.users:', userCreateError)
      // エラーでも続行（既に存在する可能性がある）
    }
  }

  // 1. 企業が存在するか確認
  const { data: existingCompany } = await supabase
    .from('companies')
    .select('id')
    .eq('name', name)
    .single()

  let companyId = existingCompany?.id

  // 2. 存在しない場合、新規作成
  if (!companyId) {
    const { data: newCompany, error: createError } = await supabase
      .from('companies')
      .insert({
        name,
        url,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating company:', createError)
      throw new Error(`Failed to create company: ${createError.message}`)
    }
    companyId = newCompany.id
  }

  // 3. ユーザーの選択状況として登録
  const { error } = await supabase.from('usercompanyselections').insert({
    company_id: companyId,
    user_id: user.id,
    status,
    motivation_level,
  })

  if (error) {
    console.error('Error adding company selection:', error)
    throw new Error(`Failed to add company selection: ${error.message} (${error.code})`)
  }

  revalidatePath('/companies')
  redirect('/companies')
}

type SearchResult = {
  title: string
  link: string
  snippet: string
}

export async function searchCompany(query: string): Promise<SearchResult[]> {
  const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000'
  
  try {
    const res = await fetch(`${backendUrl}/api/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
      cache: 'no-store'
    })

    if (!res.ok) {
      console.error('Backend search failed:', res.status, await res.text())
      return []
    }

    return await res.json()
  } catch (error) {
    console.error('Search error:', error)
    return []
  }
}

