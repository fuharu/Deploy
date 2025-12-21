'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, X, Building2 } from 'lucide-react'
import { getGmailConnectionStatus } from '@/app/settings/gmail/actions'
import { searchCompanyEmails, markEmailAsRead, type EmailData } from '@/app/gmail/actions'
import { getCompanyDomains, isCompanyEmail } from '@/utils/companyDomains'
import { createClient } from '@/utils/supabase/client'

export default function GmailNotifications() {
  const [connected, setConnected] = useState(false)
  const [emails, setEmails] = useState<EmailData[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [companies, setCompanies] = useState<{id: string, name: string}[]>([])

  useEffect(() => {
    checkConnection()
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('usercompanyselections')
      .select('company_id, companies(name)')
      .in('status', ['Entry', 'ES_Submit', 'Interview', 'Offer'])

    if (data) {
      setCompanies(data.map(d => ({
        id: d.company_id,
        name: (d.companies as any).name
      })))
    }
  }

  const checkConnection = async () => {
    const status = await getGmailConnectionStatus()
    if (status.connected) {
      setConnected(true)
      await loadAllEmails()
    } else {
      setLoading(false)
    }
  }

  const loadAllEmails = async () => {
    setLoading(true)

    // 全ての登録企業のドメインを収集
    const allDomains = new Set<string>()
    const companyNames = new Set<string>()

    for (const company of companies) {
      companyNames.add(company.name)
      const domains = getCompanyDomains(company.name)
      domains.forEach(d => allDomains.add(d))
    }

    // 企業からのメールを取得（返信メールを優先）
    const allEmails: EmailData[] = []

    // 各ドメインからメールを検索
    for (const domain of allDomains) {
      const result = await searchCompanyEmails('', domain, 30, true) // 30日以内、未読のみ
      if (result.success) {
        // 返信メールかどうかをチェック（件名にRe:が含まれる）
        const filteredEmails = result.emails.filter(email => {
          // 返信メールか、企業名が含まれるメールのみ
          const isReply = email.subject.toLowerCase().includes('re:') ||
                          email.subject.includes('返信') ||
                          email.subject.includes('回答')

          // 企業名が含まれるかチェック
          let isFromCompany = false
          for (const companyName of companyNames) {
            if (isCompanyEmail(companyName, email.from)) {
              isFromCompany = true
              break
            }
          }

          return isReply || isFromCompany
        })
        allEmails.push(...filteredEmails)
      }
    }

    // 重複を削除し、日付でソート
    const uniqueEmails = Array.from(
      new Map(allEmails.map(email => [email.id, email])).values()
    ).sort((a, b) => b.timestamp - a.timestamp)

    // 最大50件まで
    setEmails(uniqueEmails.slice(0, 50))
    setLoading(false)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadAllEmails()
    setRefreshing(false)
  }

  const handleMarkAsRead = async (emailId: string) => {
    const result = await markEmailAsRead(emailId)
    if (result.success) {
      setEmails(emails.filter(email => email.id !== emailId))
    }
  }

  if (!connected) {
    return null
  }

  if (loading) {
    return (
      <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-white/10 shadow-md">
        <div className="flex items-center gap-2 text-gray-500">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>メール取得中...</span>
        </div>
      </section>
    )
  }

  if (emails.length === 0) {
    return null // 未読メールがない場合は表示しない
  }

  return (
    <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-white/10 shadow-md shadow-indigo-50 dark:shadow-none">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2 text-indigo-950 dark:text-white">
          <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          企業からの返信 ({emails.length}件)
        </h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
          title="更新"
        >
          <RefreshCw className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {emails.map((email) => (
          <div
            key={email.id}
            className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800"
          >
            <div className="flex justify-between items-start gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate mb-1">
                  {email.subject || '(件名なし)'}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {email.from}
                </p>
              </div>
              <button
                onClick={() => handleMarkAsRead(email.id)}
                className="flex-shrink-0 p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded transition"
                title="既読にする"
              >
                <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
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
    </section>
  )
}
