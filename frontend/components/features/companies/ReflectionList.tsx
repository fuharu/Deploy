'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { MessageSquare, Plus } from 'lucide-react'
import ReflectionCard from '../reflections/ReflectionCard'
import ReflectionForm from '../reflections/ReflectionForm'
import { getReflectionByEventId, type Reflection } from '@/app/companies/[id]/reflection_actions'

type Event = {
  id: string
  title: string
  type: string
  start_time: string
  end_time?: string
  company_id?: string
}

type Props = {
  events: Event[]
}

export default function ReflectionList({ events }: Props) {
  const searchParams = useSearchParams()
  const eventIdParam = searchParams.get('eventId')
  const [reflections, setReflections] = useState<Record<string, Reflection | null>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [creatingFor, setCreatingFor] = useState<string | null>(eventIdParam)

  useEffect(() => {
    async function loadReflections() {
      setIsLoading(true)
      const reflectionsData: Record<string, Reflection | null> = {}

      for (const event of events) {
        const reflection = await getReflectionByEventId(event.id)
        reflectionsData[event.id] = reflection
      }

      setReflections(reflectionsData)
      setIsLoading(false)
    }

    loadReflections()
  }, [events])

  useEffect(() => {
    if (eventIdParam) {
      setCreatingFor(eventIdParam)
    }
  }, [eventIdParam])

  const handleReflectionCreated = async () => {
    if (creatingFor) {
      const reflection = await getReflectionByEventId(creatingFor)
      setReflections(prev => ({ ...prev, [creatingFor]: reflection }))
      setCreatingFor(null)
    }
  }

  const handleReflectionUpdated = async (eventId: string) => {
    const reflection = await getReflectionByEventId(eventId)
    setReflections(prev => ({ ...prev, [eventId]: reflection }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center text-gray-500 dark:text-slate-400">
          読み込み中...
        </div>
      </div>
    )
  }

  const eventsWithReflections = events.filter(event => reflections[event.id])
  const creatingEvent = creatingFor ? events.find(e => e.id === creatingFor) : null

  return (
    <div className="space-y-6">
      {/* 振り返り作成中のフォーム */}
      {creatingFor && creatingEvent && !reflections[creatingFor] && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {creatingEvent.title} の振り返りを作成
            </h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              {new Date(creatingEvent.start_time).toLocaleDateString('ja-JP')}
            </p>
          </div>
          <ReflectionForm
            eventId={creatingFor}
            onSuccess={handleReflectionCreated}
            onCancel={() => setCreatingFor(null)}
          />
        </div>
      )}

      {/* 振り返り済みイベント一覧 */}
      {eventsWithReflections.length > 0 && (
        <div className="space-y-4">
          {eventsWithReflections.map(event => (
            <ReflectionCard
              key={event.id}
              reflection={reflections[event.id]!}
              onUpdate={() => handleReflectionUpdated(event.id)}
            />
          ))}
        </div>
      )}

      {/* 空状態 */}
      {!creatingFor && eventsWithReflections.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-slate-400">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">振り返りがまだありません</p>
          <p className="text-sm mt-2">イベント・日程タブから「振り返り」ボタンをクリックして作成できます</p>
        </div>
      )}
    </div>
  )
}
