'use client'

import { useState, useRef } from 'react'
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
  const formRef = useRef<HTMLFormElement>(null)
  
  return (
    <div className="flex flex-col gap-4">
      {/* 常時表示の簡易追加フォーム */}
      <form 
        ref={formRef}
        action={async (formData) => {
            await addEvent(formData)
            formRef.current?.reset()
        }} 
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
                <option value="Deadline">締切</option>
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
          </div>

          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium w-full transition mt-1">
             追加
          </button>
      </form>

      <div className="flex flex-col gap-3">
        {initialEvents.map((event) => (
            <EventItem key={event.id} event={event} companyId={companyId} />
        ))}

        {initialEvents.length === 0 && (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-900/50 rounded border border-dashed border-gray-200 dark:border-gray-700">
                <div className="text-2xl mb-2 opacity-50">📅</div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    イベントはまだありません。<br/>上のフォームから予定を追加しましょう。
                </p>
            </div>
        )}
      </div>
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

