'use client'

import { useState, useEffect } from 'react'
import { Mail, RefreshCw, CheckCircle } from 'lucide-react'
import { searchCompanyEmails, markEmailAsRead, type EmailData } from '@/app/gmail/actions'

interface EmailListProps {
  companyName: string
  companyEmail?: string
}

export default function EmailList({ companyName, companyEmail }: EmailListProps) {
  const [emails, setEmails] = useState<EmailData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadEmails()
  }, [companyName, companyEmail])

  const loadEmails = async () => {
    setLoading(true)
    setError(null)
    const result = await searchCompanyEmails(companyName, companyEmail, 30, false)

    if (result.success) {
      setEmails(result.emails)
    } else {
      setError(result.error || 'メール取得失敗')
    }
    setLoading(false)
  }

  const handleMarkAsRead = async (emailId: string) => {
    const result = await markEmailAsRead(emailId)
    if (result.success) {
      setEmails(emails.map(email =>
        email.id === emailId ? { ...email, isUnread: false } : email
      ))
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-white/10 shadow-md">
        <div className="flex items-center gap-2 text-gray-500">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>メール取得中...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-white/10 shadow-md">
        <div className="text-red-600 dark:text-red-400">{error}</div>
      </div>
    )
  }

  if (emails.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-white/10 shadow-md">
        <div className="flex items-center gap-2 text-gray-500">
          <Mail className="w-4 h-4" />
          <span>メールはありません</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-white/10 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          {companyName}からのメール ({emails.length}件)
        </h3>
        <button
          onClick={loadEmails}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
        >
          <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      <div className="space-y-3">
        {emails.map((email) => (
          <div
            key={email.id}
            className={`p-4 rounded-lg border transition ${
              email.isUnread
                ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
                : 'bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-white/5'
            }`}
          >
            <div className="flex justify-between items-start gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold text-sm mb-1 ${
                  email.isUnread
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {email.subject || '(件名なし)'}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {email.from}
                </p>
              </div>
              {email.isUnread && (
                <button
                  onClick={() => handleMarkAsRead(email.id)}
                  className="flex-shrink-0 p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded transition"
                  title="既読にする"
                >
                  <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </button>
              )}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
              {email.snippet}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {new Date(email.timestamp * 1000).toLocaleString('ja-JP')}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
