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

  // 1. eventsテーブルにイベントを作成
  const { data: eventData, error: eventError } = await supabase.from('events').insert({
    company_id: company_id || null,
    title,
    type,
    start_time: new Date(start_time).toISOString(),
    end_time: new Date(final_end_time).toISOString(),
    location
  }).select().single()

  if (eventError) {
    console.error('Event creation error:', eventError)
    throw new Error('イベントの作成に失敗しました')
  }

  // 2. usereventsテーブルにユーザーとイベントの関連を作成
  const { error: userEventError } = await supabase.from('userevents').insert({
    event_id: eventData.id,
    user_id: user.id,
    status: 'Entry' // デフォルトステータス
  })

  if (userEventError) {
    console.error('UserEvent creation error:', userEventError)
    // イベントは作成されたがusereventsの作成に失敗した場合、イベントを削除
    await supabase.from('events').delete().eq('id', eventData.id)
    throw new Error('イベントとユーザーの関連付けに失敗しました')
  }

  revalidatePath(`/companies/${company_id}`)
}

export async function deleteEvent(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  const company_id = formData.get('company_id') as string

  // usereventsの関連は外部キー制約でON DELETE CASCADEが設定されていれば自動削除される
  // 設定されていない場合は先にusereventsを削除
  await supabase.from('userevents').delete().eq('event_id', id)

  // イベント本体を削除
  await supabase.from('events').delete().eq('id', id)

  revalidatePath(`/companies/${company_id}`)
}

