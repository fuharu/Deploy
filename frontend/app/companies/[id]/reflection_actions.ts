'use server'

import { revalidatePath } from 'next/cache'

// Server Actions用のバックエンドURL（Dockerコンテナ内部ではサービス名を使用）
const BACKEND_URL = 'http://backend:8000'

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
    const response = await fetch(`${BACKEND_URL}/api/reflections?event_id=${eventId}`, {
      cache: 'no-store'
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.reflections && data.reflections.length > 0 ? data.reflections[0] : null
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
    const response = await fetch(`${BACKEND_URL}/api/reflections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_id: eventId,
        content,
        good_points: goodPoints,
        bad_points: badPoints,
        self_score: selfScore,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || '振り返りの作成に失敗しました')
    }

    const data = await response.json()
    revalidatePath('/companies')
    return { success: true, reflection: data.reflection }
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
    const response = await fetch(`${BACKEND_URL}/api/reflections/${reflectionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_id: eventId,
        content,
        good_points: goodPoints,
        bad_points: badPoints,
        self_score: selfScore,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || '振り返りの更新に失敗しました')
    }

    const data = await response.json()
    revalidatePath('/companies')
    return { success: true, reflection: data.reflection }
  } catch (error) {
    console.error('Failed to update reflection:', error)
    return { success: false, error: error instanceof Error ? error.message : '更新に失敗しました' }
  }
}

export async function deleteReflection(reflectionId: string) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/reflections/${reflectionId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || '振り返りの削除に失敗しました')
    }

    revalidatePath('/companies')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete reflection:', error)
    return { success: false, error: error instanceof Error ? error.message : '削除に失敗しました' }
  }
}
