'use client'

import Link from 'next/link'

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
        📅 今週のスケジュール
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {weekDays.map((date, i) => {
          const dateKey = date.toDateString()
          const dayEvents = eventsByDate[dateKey] || []
          const isToday = date.toDateString() === today.toDateString()
          const weekDayNames = ['日', '月', '火', '水', '木', '金', '土']

          return (
            <div key={i} className={`flex flex-col md:h-full md:min-h-[150px] min-h-[80px] border rounded p-2 transition-colors ${isToday ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700' : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800'}`}>
              <div className={`text-left md:text-center mb-2 text-sm font-bold flex justify-between md:block ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300'}`}>
                <span>{date.getDate()} ({weekDayNames[i]})</span>
                {/* スマホ表示時のみ「今日」ラベルを出すなどの工夫も可 */}
              </div>
              <div className="flex flex-col gap-2 flex-1">
                {dayEvents.map(event => (
                  <Link href={`/companies/${(event as any).company_id || '#'}`} key={event.id} className="block">
                     <div className="bg-white dark:bg-gray-800 p-1.5 rounded border dark:border-gray-700 text-xs shadow-sm hover:shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                        <div className="font-bold truncate dark:text-white">{event.title}</div>
                        <div className="text-gray-500 dark:text-gray-400 truncate text-[10px]">
                           {new Date(event.start_time).getHours()}:{new Date(event.start_time).getMinutes().toString().padStart(2, '0')}
                           {event.companies && ` | ${event.companies.name}`}
                        </div>
                     </div>
                  </Link>
                ))}
                {dayEvents.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-xs py-2">
                        <span className="text-lg opacity-30">📅</span>
                        <span className="mt-1">予定なし</span>
                    </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

