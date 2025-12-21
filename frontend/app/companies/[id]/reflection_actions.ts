'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export interface Reflection {
  id: string
  event_id: string
  content?: string
  good_points?: string
  bad_points?: string
  self_score?: number
  created_at: string
  events?: {
    id: string
    title: string
    type: string
    start_time: string
    end_time?: string
    company_id?: string
    companies?: {
      name: string
    }
  }
}

export async function getReflectionByEventId(eventId: string): Promise<Reflection | null> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // eventsテーブルとjoinして振り返りを取得
    const { data, error } = await supabase
      .from('reflections')
      .select(`
        *,
        events:event_id (
          id,
          title,
          type,
          start_time,
          end_time,
          company_id,
          companies:company_id (
            name
          )
        )
      `)
      .eq('event_id', eventId)
      .single()

    if (error || !data) {
      return null
    }

    return data as Reflection
  } catch (error) {
    console.error('Failed to fetch reflection:', error)
    return null
  }
}

export async function createReflection(formData: FormData) {
  const eventId = formData.get('event_id') as string
  const content = formData.get('content') as string
  const goodPoints = formData.get('good_points') as string
  const badPoints = formData.get('bad_points') as string
  const selfScore = parseInt(formData.get('self_score') as string)

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('ユーザーが認証されていません')
    }

    const { data, error } = await supabase
      .from('reflections')
      .insert({
        event_id: eventId,
        content,
        good_points: goodPoints,
        bad_points: badPoints,
        self_score: selfScore,
      })
      .select()
      .single()

    if (error) {
      throw new Error(error.message || '振り返りの作成に失敗しました')
    }

    revalidatePath('/companies')
    return { success: true, reflection: data }
  } catch (error) {
    console.error('Failed to create reflection:', error)
    return { success: false, error: error instanceof Error ? error.message : '作成に失敗しました' }
  }
}

export async function updateReflection(reflectionId: string, formData: FormData) {
  const eventId = formData.get('event_id') as string
  const content = formData.get('content') as string
  const goodPoints = formData.get('good_points') as string
  const badPoints = formData.get('bad_points') as string
  const selfScore = parseInt(formData.get('self_score') as string)

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('ユーザーが認証されていません')
    }

    const { data, error } = await supabase
      .from('reflections')
      .update({
        event_id: eventId,
        content,
        good_points: goodPoints,
        bad_points: badPoints,
        self_score: selfScore,
      })
      .eq('id', reflectionId)
      .select()
      .single()

    if (error) {
      throw new Error(error.message || '振り返りの更新に失敗しました')
    }

    revalidatePath('/companies')
    return { success: true, reflection: data }
  } catch (error) {
    console.error('Failed to update reflection:', error)
    return { success: false, error: error instanceof Error ? error.message : '更新に失敗しました' }
  }
}

export async function deleteReflection(reflectionId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('ユーザーが認証されていません')
    }

    const { error } = await supabase
      .from('reflections')
      .delete()
      .eq('id', reflectionId)

    if (error) {
      throw new Error(error.message || '振り返りの削除に失敗しました')
    }

    revalidatePath('/companies')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete reflection:', error)
    return { success: false, error: error instanceof Error ? error.message : '削除に失敗しました' }
  }
}
