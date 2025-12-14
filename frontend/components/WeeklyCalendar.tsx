'use client'

import Link from 'next/link'
import { CalendarDays, Clock, Users, Presentation, FileWarning, Calendar } from 'lucide-react'

type Event = {
  id: string
  title: string
  start_time: string
  type: string
  companies: { name: string } | null
}

const getEventIcon = (type: string) => {
  switch (type) {
    case 'Interview': return <Users className="w-3 h-3 text-amber-500" />;
    case 'Seminar': return <Presentation className="w-3 h-3 text-emerald-500" />;
    case 'Deadline': return <FileWarning className="w-3 h-3 text-rose-500" />;
    default: return <Calendar className="w-3 h-3 text-indigo-500" />;
  }
}

const getEventBorderColor = (type: string) => {
  switch (type) {
    case 'Interview': return 'border-l-amber-500 dark:border-l-amber-400';
    case 'Seminar': return 'border-l-emerald-500 dark:border-l-emerald-400';
    case 'Deadline': return 'border-l-rose-500 dark:border-l-rose-400';
    default: return 'border-l-indigo-500 dark:border-l-indigo-400';
  }
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
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-white/20 shadow-md shadow-indigo-50 dark:shadow-none p-6 transition-all hover:shadow-lg dark:hover:shadow-none hover:-translate-y-1">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-white text-indigo-950">
        <CalendarDays className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> 今週のスケジュール
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {weekDays.map((date, i) => {
          const dateKey = date.toDateString()
          const dayEvents = eventsByDate[dateKey] || []
          const isToday = date.toDateString() === today.toDateString()
          const weekDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

          return (
            <div key={i} className={`flex flex-col md:h-full md:min-h-[150px] min-h-[80px] rounded-2xl p-2 transition-all ${isToday ? 'bg-white dark:bg-slate-800 border-2 border-indigo-600 dark:border-indigo-400 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 z-10 scale-[1.02]' : 'bg-gray-50 dark:bg-slate-800/50 border border-transparent hover:border-gray-300 dark:hover:border-white/20'}`}>
              <div className={`text-left md:text-center mb-3 text-sm font-bold flex justify-between md:flex-col md:items-center items-center gap-1 ${i === 0 ? 'text-rose-500' : i === 6 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-slate-400'}`}>
                <span className="text-[10px] uppercase tracking-wider font-sans">{weekDayNames[i]}</span>
                <span className={`w-8 h-8 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white shadow-md' : ''} text-lg font-mono`}>{date.getDate()}</span>
              </div>
              <div className="flex flex-col gap-2 flex-1">
                {dayEvents.map(event => (
                  <Link href={`/companies/${(event as any).company_id || '#'}`} key={event.id} className="block group">
                     <div className={`bg-white dark:bg-slate-800 p-2 rounded-xl border-l-4 ${getEventBorderColor(event.type)} border-y border-r border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all`}>
                        <div className="font-bold truncate dark:text-gray-100 text-xs mb-1 flex items-center gap-1">
                            {getEventIcon(event.type)}
                            <span className="truncate">{event.title}</span>
                        </div>
                        <div className="text-gray-500 dark:text-slate-400 truncate text-[10px] flex items-center gap-1 pl-4 font-mono">
                           <span>{new Date(event.start_time).getHours()}:{new Date(event.start_time).getMinutes().toString().padStart(2, '0')}</span>
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
