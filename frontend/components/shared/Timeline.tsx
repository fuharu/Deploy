'use client'

import { CheckCircle2, Circle } from 'lucide-react'

interface TimelineItemProps {
  date: string
  title: string
  description?: string
  variant?: 'primary' | 'success' | 'info' | 'warning'
}

export function Timeline({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative pl-8">
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
      {children}
    </div>
  )
}

export function TimelineItem({ date, title, description, variant = 'primary' }: TimelineItemProps) {
  const variantStyles = {
    primary: 'bg-indigo-500 border-indigo-500',
    success: 'bg-emerald-500 border-emerald-500',
    info: 'bg-blue-500 border-blue-500',
    warning: 'bg-amber-500 border-amber-500',
  }

  return (
    <div className="relative pb-6 last:pb-0">
      <div className={`absolute -left-11 top-1 w-3 h-3 rounded-full border-2 bg-white dark:bg-gray-800 ${variantStyles[variant]}`} />
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{date}</div>
      <div className="font-semibold text-gray-900 dark:text-white">{title}</div>
      {description && (
        <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">{description}</div>
      )}
    </div>
  )
}

