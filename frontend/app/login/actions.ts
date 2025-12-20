'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Login Error:', error)
    redirect(`/error?message=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    console.error('Signup Error:', error)
    redirect(`/error?message=${encodeURIComponent(error.message)}`)
  }

  // public.users にレコードを作成
  if (data.user) {
    const { error: userCreateError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email: data.user.email || email,
        name: data.user.user_metadata?.name || data.user.user_metadata?.full_name || 'ユーザー',
        university: data.user.user_metadata?.university || '未設定',
      })

    if (userCreateError) {
      console.error('Error creating user in public.users:', userCreateError)
      // エラーでも続行（既に存在する可能性がある）
    }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}
