'use client'

import { useState, useEffect } from 'react'
import { Mail, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { getGmailConnectionStatus, getGmailAuthUrl, disconnectGmail } from '@/app/settings/gmail/actions'

export default function GmailConnection() {
  const [status, setStatus] = useState<{
    connected: boolean
    email: string | null
    connectedAt?: string
    expiresAt?: string
    isExpired?: boolean
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [disconnecting, setDisconnecting] = useState(false)

  useEffect(() => {
    loadStatus()
  }, [])

  const loadStatus = async () => {
    setLoading(true)
    const result = await getGmailConnectionStatus()
    setStatus(result)
    setLoading(false)
  }

  const handleConnect = async () => {
    const authUrl = await getGmailAuthUrl()
    window.location.href = authUrl
  }

  const handleDisconnect = async () => {
    if (!confirm('Gmail連携を解除しますか？')) return

    setDisconnecting(true)
    const result = await disconnectGmail()

    if (result.success) {
      await loadStatus()
    } else {
      alert('連携解除に失敗しました')
    }
    setDisconnecting(false)
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="w-6 h-6 text-gray-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Gmail連携
          </h2>
        </div>
        <p className="text-gray-500 dark:text-gray-400">読み込み中...</p>
      </div>
    )
  }

  return (
    <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-white/10 shadow-md shadow-indigo-50 dark:shadow-none relative overflow-hidden group hover:shadow-lg dark:hover:shadow-none transition-all hover:-translate-y-1">
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
        <Mail className="w-32 h-32 text-indigo-900" />
      </div>

      <div className="flex justify-between items-center mb-6 relative z-10">
        <h2 className="text-lg font-bold flex items-center gap-2 dark:text-white text-indigo-950">
          <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Gmail連携
        </h2>
        {status?.connected && (
          <span className="text-xs bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300 px-3 py-1 rounded-full font-bold">
            接続済み
          </span>
        )}
      </div>

      <div className="relative z-10">

      {status?.connected ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                連携済み
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                {status.email} でGmailに接続されています
              </p>
              {status.connectedAt && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  接続日時: {new Date(status.connectedAt).toLocaleString('ja-JP')}
                </p>
              )}
            </div>
          </div>

          {status.isExpired && (
            <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                  トークンの有効期限切れ
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  再度連携してください
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition"
            >
              {disconnecting ? '解除中...' : '連携を解除'}
            </button>

            {status.isExpired && (
              <button
                onClick={handleConnect}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition"
              >
                再接続
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-white/10">
            <XCircle className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">
                未接続
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Gmailと連携すると、企業からのメールを自動的にチェックして通知します。
              </p>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                <li>企業ごとの未読メール数を表示</li>
                <li>メールの件名と内容をプレビュー</li>
                <li>重要なメールを見逃さない</li>
              </ul>
            </div>
          </div>

          <button
            onClick={handleConnect}
            className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-sm transition shadow-sm hover:shadow-md flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Googleアカウントで連携
          </button>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            メールの読み取り権限のみ要求します。送信や削除の権限は要求しません。
          </p>
        </div>
      )}
      </div>
    </section>
  )
}
