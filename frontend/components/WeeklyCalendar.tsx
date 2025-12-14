'use client'

import Link from 'next/link'
import { CalendarDays, Clock } from 'lucide-react'

type Event = {
  id: string
  title: string
  start_time: string
  companies: { name: string } | null
}

export default function WeeklyCalendar({ events }: { events: Event[] }) {
  // 今週の日曜〜土曜の日付を取得
  const today = new Date()
  const dayOfWeek = today.getDay() // 0 (Sun) - 6 (Sat)
  const sunday = new Date(today)
  sunday.setDate(today.getDate() - dayOfWeek)
  sunday.setHours(0, 0, 0, 0)

  const weekDays = [...Array(7)].map((_, i) => {
    const d = new Date(sunday)
    d.setDate(sunday.getDate() + i)
    return d
  })

  // 日付ごとにイベントをグルーピング
  const eventsByDate: { [key: string]: Event[] } = {}
  events.forEach(event => {
    const d = new Date(event.start_time)
    const dateKey = d.toDateString() // "Sun Dec 13 2025"
    if (!eventsByDate[dateKey]) eventsByDate[dateKey] = []
    eventsByDate[dateKey].push(event)
  })

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm p-6 transition-colors">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-white">
        <CalendarDays className="w-6 h-6 text-indigo-500" /> 今週のスケジュール
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {weekDays.map((date, i) => {
          const dateKey = date.toDateString()
          const dayEvents = eventsByDate[dateKey] || []
          const isToday = date.toDateString() === today.toDateString()
          const weekDayNames = ['日', '月', '火', '水', '木', '金', '土']

          return (
            <div key={i} className={`flex flex-col md:h-full md:min-h-[150px] min-h-[80px] border dark:border-gray-700 rounded-lg p-2 transition-colors ${isToday ? 'bg-indigo-50 dark:bg-indigo-900/10 ring-2 ring-indigo-300 dark:ring-indigo-500 border-transparent' : 'bg-gray-50 dark:bg-transparent'}`}>
              <div className={`text-left md:text-center mb-3 text-sm font-bold flex justify-between md:flex-col md:items-center items-center gap-1 ${i === 0 ? 'text-red-500 dark:text-red-400' : i === 6 ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'}`}>
                <span className="text-xs opacity-70">{weekDayNames[i]}</span>
                <span className={`w-8 h-8 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white' : ''} text-lg`}>{date.getDate()}</span>
              </div>
              <div className="flex flex-col gap-2 flex-1">
                {dayEvents.map(event => (
                  <Link href={`/companies/${(event as any).company_id || '#'}`} key={event.id} className="block group">
                     <div className="bg-white dark:bg-gray-700 p-2 rounded border-l-4 border-l-indigo-500 border-y border-r border-gray-100 dark:border-gray-600 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
                        <div className="font-bold truncate dark:text-gray-100 text-xs mb-0.5">{event.title}</div>
                        <div className="text-gray-500 dark:text-gray-300 truncate text-[10px] flex items-center gap-1">
                           <Clock className="w-3 h-3" /> <span>{new Date(event.start_time).getHours()}:{new Date(event.start_time).getMinutes().toString().padStart(2, '0')}</span>
                        </div>
                     </div>
                  </Link>
                ))}
                {dayEvents.length === 0 && (
                    <div className="flex-1"></div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

