'use client'

import { useState, useEffect } from 'react'
import { Mail } from 'lucide-react'
import { getUnreadCount } from '@/app/gmail/actions'

interface CompanyEmailNotificationProps {
  companyName: string
  companyEmail?: string
}

export default function CompanyEmailNotification({ companyName, companyEmail }: CompanyEmailNotificationProps) {
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUnreadCount()
  }, [companyName, companyEmail])

  const loadUnreadCount = async () => {
    setLoading(true)
    const result = await getUnreadCount(companyName, companyEmail)
    if (result.success) {
      setUnreadCount(result.count)
    }
    setLoading(false)
  }

  if (loading) {
    return null
  }

  if (unreadCount === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-1 text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-1 rounded-full">
      <Mail className="w-3 h-3" />
      <span className="font-bold">{unreadCount}</span>
    </div>
  )
}
