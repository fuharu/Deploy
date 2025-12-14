'use client'

import { useState } from 'react'
import { addEvent, deleteEvent } from '@/app/companies/[id]/event_actions'

type Event = {
  id: string
  title: string
  type: 'Interview' | 'Deadline' | 'Seminar' | 'Other'
  start_time: string
  end_time: string
  location: string | null
}

export default function EventList({ 
  companyId, 
  initialEvents 
}: { 
  companyId: string, 
  initialEvents: Event[] 
}) {
  const [isAdding, setIsAdding] = useState(false)
  
  return (
    <div className="flex flex-col gap-4">
      {initialEvents.map((event) => (
        <EventItem key={event.id} event={event} companyId={companyId} />
      ))}

      {initialEvents.length === 0 && !isAdding && (
          <div className="text-center py-6 bg-gray-50 rounded border border-dashed border-gray-200 mb-4">
              <div className="text-2xl mb-2">📅</div>
              <p className="text-sm text-gray-500 mb-2">まだイベントがありません</p>
              <button 
                  onClick={() => setIsAdding(true)} 
                  className="text-blue-600 text-sm font-bold hover:underline"
              >
                  最初の予定を登録しましょう！
              </button>
          </div>
      )}

      {isAdding ? (
        <form action={async (formData) => {
            await addEvent(formData)
            setIsAdding(false)
        }} className="border p-4 rounded bg-gray-50 flex flex-col gap-3">
            <input type="hidden" name="company_id" value={companyId} />
            
            <div className="grid grid-cols-2 gap-2">
                <input name="title" placeholder="イベント名 (一次面接など)" required className="border p-2 rounded w-full text-sm" />
                <select name="type" className="border p-2 rounded w-full text-sm">
                    <option value="Interview">面接</option>
                    <option value="Deadline">締切</option>
                    <option value="Seminar">説明会</option>
                    <option value="Other">その他</option>
                </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col">
                    <label className="text-xs text-gray-500">開始日時</label>
                    <input name="start_time" type="datetime-local" required className="border p-2 rounded w-full text-sm" />
                </div>
                <div className="flex flex-col">
                    <label className="text-xs text-gray-500">終了日時</label>
                    <input name="end_time" type="datetime-local" className="border p-2 rounded w-full text-sm" />
                </div>
            </div>

            <input name="location" placeholder="場所 (URLまたは住所)" className="border p-2 rounded w-full text-sm" />

            <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setIsAdding(false)} className="text-sm text-gray-500">キャンセル</button>
                <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded text-sm">追加</button>
            </div>
        </form>
      ) : (
        <button 
            onClick={() => setIsAdding(true)} 
            className="text-blue-500 text-sm hover:underline text-left"
        >
            + イベントを追加
        </button>
      )}
    </div>
  )
}

function EventItem({ event, companyId }: { event: Event, companyId: string }) {
  const startDate = new Date(event.start_time)
  const endDate = new Date(event.end_time)
  
  // 日付フォーマット: MM/DD HH:mm
  const format = (d: Date) => `${d.getMonth()+1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`

  return (
    <div className="border-l-4 border-blue-500 bg-white dark:bg-gray-800 p-3 rounded shadow-sm hover:shadow transition group">
        <div className="flex justify-between items-start">
            <div>
                <div className="font-bold text-sm mb-1 dark:text-white">{event.title} <span className="text-xs font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1 rounded ml-1">{event.type}</span></div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                    🕒 {format(startDate)} ~ {format(endDate)}
                </div>
                {event.location && (
                    <div className="text-xs text-blue-500 dark:text-blue-400 mt-1 truncate max-w-[200px]">
                        📍 {event.location}
                    </div>
                )}
            </div>
            <form action={deleteEvent} className="opacity-0 group-hover:opacity-100 transition">
                <input type="hidden" name="id" value={event.id} />
                <input type="hidden" name="company_id" value={companyId} />
                <button className="text-red-400 hover:text-red-600 text-xs">削除</button>
            </form>
        </div>
    </div>
  )
}

