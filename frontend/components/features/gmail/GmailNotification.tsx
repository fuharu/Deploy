'use client'

import { useState, useEffect } from 'react'
import { Mail, Bell, ExternalLink } from 'lucide-react'
import { searchCompanyEmails, getUnreadCount, type EmailData, type GmailCredentials } from '@/app/gmail/actions'

type Props = {
  companyName: string
  companyEmail?: string
  credentials?: GmailCredentials | null
}

export default function GmailNotification({ companyName, companyEmail, credentials }: Props) {
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [emails, setEmails] = useState<EmailData[]>([])
  const [showEmails, setShowEmails] = useState(false)
  const [loading, setLoading] = useState(false)

  // 未読数を取得
  useEffect(() => {
    if (!credentials) return

    const fetchUnreadCount = async () => {
      const count = await getUnreadCount(credentials, companyName, companyEmail)
      setUnreadCount(count)
    }

    fetchUnreadCount()
    // 30秒ごとに更新
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [credentials, companyName, companyEmail])

  // メール一覧を取得
  const handleShowEmails = async () => {
    if (!credentials) return

    setLoading(true)
    setShowEmails(true)

    const emailList = await searchCompanyEmails(
      credentials,
      companyName,
      companyEmail,
      30,
      false
    )

    setEmails(emailList)
    setLoading(false)
  }

  if (!credentials) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              メール通知を有効にする
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
              Gmail連携を設定すると、この企業からのメールを自動的にチェックして通知します。
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
              Gmail連携を設定
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            メール通知
          </h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={handleShowEmails}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          {showEmails ? 'メールを隠す' : 'メールを表示'}
        </button>
      </div>

      {unreadCount === 0 && !showEmails && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          未読メールはありません
        </p>
      )}

      {showEmails && (
        <div className="mt-4 space-y-2">
          {loading && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              読み込み中...
            </p>
          )}

          {!loading && emails.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              メールが見つかりませんでした
            </p>
          )}

          {!loading && emails.map((email) => (
            <div
              key={email.id}
              className={`p-3 rounded-lg border ${
                email.is_unread
                  ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {email.is_unread && (
                      <Bell className="w-3 h-3 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    )}
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                      {email.subject}
                    </h4>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {email.from_address}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-2">
                    {email.snippet}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                    {new Date(email.timestamp * 1000).toLocaleString('ja-JP')}
                  </p>
                </div>
                <a
                  href={`https://mail.google.com/mail/u/0/#inbox/${email.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex-shrink-0"
                  title="Gmailで開く"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
