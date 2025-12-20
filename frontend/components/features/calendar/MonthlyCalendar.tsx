'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import Link from 'next/link'

interface Event {
  id: string
  title: string
  start_time: string
  type: string
  companies: { name: string } | null
}

interface MonthlyCalendarProps {
  events: Event[]
}

export function MonthlyCalendar({ events }: MonthlyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  const dayNames = ['日', '月', '火', '水', '木', '金', '土']

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return events.filter(event => event.start_time.startsWith(dateStr))
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const renderCalendarDays = () => {
    const days = []
    
    // 前月の空白セル
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="aspect-square p-1">
          <div className="h-full bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-100 dark:border-gray-800"></div>
        </div>
      )
    }

    // 今月の日付
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dayEvents = getEventsForDate(date)
      const today = isToday(date)

      days.push(
        <div key={day} className="aspect-square p-1">
          <div className={`h-full rounded border p-1 flex flex-col ${
            today 
              ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700' 
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
          }`}>
            <div className={`text-xs font-bold mb-1 ${
              today 
                ? 'text-indigo-700 dark:text-indigo-300' 
                : 'text-gray-700 dark:text-gray-300'
            }`}>
              {day}
            </div>
            <div className="flex-1 overflow-y-auto space-y-0.5">
              {dayEvents.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className={`text-[10px] px-1 py-0.5 rounded truncate ${
                    event.type === 'Interview' 
                      ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200'
                      : event.type === 'Seminar'
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                  title={event.title}
                >
                  {event.title}
                </div>
              ))}
              {dayEvents.length > 3 && (
                <div className="text-[10px] text-gray-500 dark:text-gray-400 px-1">
                  +{dayEvents.length - 3}
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    return days
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border dark:border-gray-700 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {year}年{monthNames[month]}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-bold text-gray-600 dark:text-gray-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {renderCalendarDays()}
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-amber-100 dark:bg-amber-900/40"></div>
          <span className="text-gray-600 dark:text-gray-400">面接</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-100 dark:bg-blue-900/40"></div>
          <span className="text-gray-600 dark:text-gray-400">説明会</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gray-100 dark:bg-gray-700"></div>
          <span className="text-gray-600 dark:text-gray-400">その他</span>
        </div>
      </div>
    </div>
  )
}

