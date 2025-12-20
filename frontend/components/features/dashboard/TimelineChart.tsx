'use client'

import { Timeline, TimelineItem } from '@/components/shared/Timeline'

interface TimelineEvent {
  date: string
  type: 'status_change' | 'event' | 'es_submit'
  title: string
  company: string
  description?: string
}

interface TimelineChartProps {
  events: TimelineEvent[]
}

export function TimelineChart({ events }: TimelineChartProps) {
  if (events.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border dark:border-gray-700 shadow-sm">
        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">選考タイムライン</h3>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">タイムラインイベントはありません</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border dark:border-gray-700 shadow-sm">
      <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">選考タイムライン</h3>
      <Timeline>
        {events.map((event, index) => (
          <TimelineItem
            key={index}
            date={event.date}
            title={event.title}
            description={event.description}
            variant={event.type === 'status_change' ? 'primary' : event.type === 'es_submit' ? 'success' : 'info'}
          />
        ))}
      </Timeline>
    </div>
  )
}

