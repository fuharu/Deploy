'use client'

import { useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { addEvent, deleteEvent } from '@/app/companies/[id]/event_actions'
import { Calendar, Clock, MapPin, Trash2, CheckSquare } from 'lucide-react'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useToast } from '@/components/providers/ToastProvider'

type Event = {
  id: string
  title: string
  type: 'Interview' | 'Seminar' | 'Other'
  start_time: string
  end_time: string | null
  location: string | null
  description: string | null
}

export default function EventList({
  companyId,
  initialEvents
}: {
  companyId: string,
  initialEvents: Event[]
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const router = useRouter()
  const { showSuccess, showError } = useToast()

  const handleAddEvent = async (formData: FormData) => {
    const title = formData.get('title') as string
    const type = formData.get('type') as Event['type']
    const start_time = formData.get('start_time') as string
    const end_time = formData.get('end_time') as string
    const description = formData.get('description') as string || null

    // オプティミスティック更新
    const tempId = `temp-${Date.now()}`
    const newEvent: Event = {
      id: tempId,
      title,
      type,
      start_time,
      end_time,
      location: null,
      description,
    }
    setEvents((prev) => [...prev, newEvent])
    formRef.current?.reset()

    try {
      await addEvent(formData)
      showSuccess('イベントを追加しました')
      router.refresh()
    } catch (error) {
      // ロールバック
      setEvents((prev) => prev.filter((e) => e.id !== tempId))
      showError('イベントの追加に失敗しました')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 常時表示の簡易追加フォーム */}
      <form
        ref={formRef}
        action={handleAddEvent}
        className="flex flex-col gap-3 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border dark:border-gray-700"
      >
        <input type="hidden" name="company_id" value={companyId} />

        <div className="flex gap-2">
          <input
            name="title"
            placeholder="新しいイベントを追加..."
            required
            className="border dark:border-gray-600 rounded px-3 py-2 flex-1 text-sm dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 min-w-0"
          />
          <select name="type" className="border dark:border-gray-600 rounded px-2 py-2 text-sm w-24 md:w-28 dark:bg-gray-700 dark:text-white shrink-0">
            <option value="Interview">面接</option>
            <option value="Seminar">説明会</option>
            <option value="Other">その他</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 w-8 shrink-0">開始</span>
            <input
              name="start_time"
              type="datetime-local"
              required
              className="border dark:border-gray-600 rounded px-2 py-2 text-sm flex-1 dark:bg-gray-700 dark:text-white min-w-0"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 w-8 shrink-0">終了</span>
            <input
              name="end_time"
              type="datetime-local"
              className="border dark:border-gray-600 rounded px-2 py-2 text-sm flex-1 dark:bg-gray-700 dark:text-white min-w-0"
            />
          </div>
          <textarea
            name="description"
            placeholder="説明 (任意)"
            rows={2}
            className="border dark:border-gray-600 rounded px-2 py-2 text-sm dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 resize-y"
          />
        </div>

        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm font-medium w-full transition mt-1">
          追加
        </button>
      </form>

      <div className="flex flex-col gap-3">
        {events.map((event) => (
          <EventItem key={event.id} event={event} companyId={companyId} setEvents={setEvents} />
        ))}

        {events.length === 0 && (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-900/50 rounded border border-dashed border-gray-200 dark:border-gray-700">
            <div className="flex justify-center mb-2">
              <Calendar className="w-8 h-8 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              イベントはまだありません。<br />上のフォームから予定を追加しましょう。
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function EventItem({ event, companyId, setEvents }: { event: Event, companyId: string, setEvents: React.Dispatch<React.SetStateAction<Event[]>> }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { showSuccess, showError } = useToast()
  const startDate = new Date(event.start_time)
  const endDate = event.end_time ? new Date(event.end_time) : null

  // 日付フォーマット: MM/DD HH:mm
  const format = (d: Date) => `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`

  const handleDelete = async () => {
    setIsDeleting(true)
    const eventId = event.id

    // オプティミスティック更新
    setEvents((prev) => prev.filter((e) => e.id !== eventId))

    try {
      const formData = new FormData()
      formData.append('id', event.id)
      formData.append('company_id', companyId)
      await deleteEvent(formData)
      showSuccess('イベントを削除しました')
      router.refresh()
    } catch (error) {
      // ロールバック
      setEvents((prev) => [...prev, event])
      showError('削除に失敗しました')
      console.error('Delete error:', error)
    } finally {
      setIsDeleting(false)
      setIsOpen(false)
    }
  }

  const handleReflectionClick = () => {
    // 振り返りログタブに遷移し、このイベントの振り返りフォームを表示
    const currentPath = pathname || `/companies/${companyId}`
    router.push(`${currentPath}?tab=reflections&eventId=${event.id}`)
    router.refresh() // 強制的にページを更新
  }

  return (
    <>
      <div className="border-l-4 border-indigo-500 dark:border-indigo-400 bg-white dark:bg-gray-800 p-3 rounded shadow-sm hover:shadow transition group">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="font-bold text-sm mb-1 dark:text-white">{event.title} <span className="text-xs font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1 rounded ml-1">{event.type}</span></div>
            <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {format(startDate)}{endDate ? ` ~ ${format(endDate)}` : ''}
            </div>
            {event.location && (
              <div className="text-xs text-indigo-500 dark:text-indigo-400 mt-1 truncate max-w-[200px] flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {event.location}
              </div>
            )}
            {event.description && (
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                {event.description}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 ml-3">
            <button
              onClick={handleReflectionClick}
              className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              振り返り
            </button>
            <button
              onClick={() => setIsOpen(true)}
              disabled={isDeleting}
              className="opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-red-600 text-xs p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <ConfirmDialog
        isOpen={isOpen}
        title="イベントを削除しますか？"
        message={`「${event.title}」を削除します。この操作は取り消せません。`}
        confirmText="削除する"
        cancelText="キャンセル"
        onConfirm={handleDelete}
        onCancel={() => setIsOpen(false)}
        variant="danger"
      />
    </>
  )
}

