'use client'

import { useState, useEffect, useRef } from 'react'
import { Mail, X, RefreshCw, Building2 } from 'lucide-react'
import { getGmailConnectionStatus, getGmailAuthUrl } from '@/app/settings/gmail/actions'
import { searchCompanyEmails, markEmailAsRead, type EmailData } from '@/app/gmail/actions'
import { getCompanyDomains, isCompanyEmail } from '@/utils/companyDomains'
import { createClient } from '@/utils/supabase/client'

export default function GmailMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [emails, setEmails] = useState<EmailData[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [companies, setCompanies] = useState<{id: string, name: string}[]>([])
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const init = async () => {
      const companyList = await loadCompanies()
      await checkConnection(companyList)
    }
    init()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const loadCompanies = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('usercompanyselections')
      .select('company_id, companies(name)')
      .in('status', ['Entry', 'ES_Submit', 'Interview', 'Offer'])

    console.log('🔍 Loading companies:', { data, error })

    if (data) {
      const companyList = data.map(d => ({
        id: d.company_id,
        name: (d.companies as any).name
      }))
      console.log('📋 Company list:', companyList)
      setCompanies(companyList)
      return companyList // 返り値として返す
    }
    return []
  }

  const checkConnection = async (companyList?: {id: string, name: string}[]) => {
    setLoading(true)
    const status = await getGmailConnectionStatus()
    setConnected(status.connected)
    if (status.connected) {
      const targetCompanies = companyList || companies
      if (targetCompanies.length > 0) {
        await loadEmailsForCompanies(targetCompanies)
      }
    }
    setLoading(false)
  }

  const loadEmailsForCompanies = async (companyList: {id: string, name: string}[]) => {
    console.log('📧 Loading emails for companies:', companyList)

    // 企業がない場合は処理しない
    if (!companyList || companyList.length === 0) {
      console.log('⚠️ No companies found')
      setEmails([])
      return
    }

    // 全ての登録企業のドメインを収集
    const allDomains = new Set<string>()
    const companyNames = new Set<string>()

    for (const company of companyList) {
      companyNames.add(company.name)
      const domains = getCompanyDomains(company.name)
      console.log(`🏢 Company: ${company.name}, Domains:`, domains)
      domains.forEach(d => allDomains.add(d))
    }

    console.log('🔎 All domains to search:', Array.from(allDomains))
    console.log('🏢 All company names:', Array.from(companyNames))

    // 企業からのメールを取得（返信メールを優先）
    const allEmails: EmailData[] = []

    // 各ドメインからメールを検索
    for (const domain of allDomains) {
      console.log(`🔍 Searching emails from domain: ${domain}`)
      const result = await searchCompanyEmails('', domain, 30, true) // 30日以内、未読のみ
      console.log(`📬 Found ${result.emails?.length || 0} emails from ${domain}`)

      if (result.success && result.emails) {
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

          const shouldInclude = isReply || isFromCompany
          if (shouldInclude) {
            console.log(`✅ Including email: "${email.subject}" from ${email.from}`)
          } else {
            console.log(`❌ Excluding email: "${email.subject}" from ${email.from}`)
          }

          return shouldInclude
        })
        allEmails.push(...filteredEmails)
      }
    }

    // 重複を削除し、日付でソート
    const uniqueEmails = Array.from(
      new Map(allEmails.map(email => [email.id, email])).values()
    ).sort((a, b) => b.timestamp - a.timestamp)

    console.log(`📨 Total filtered emails: ${uniqueEmails.length}`)

    // 最大50件まで
    const finalEmails = uniqueEmails.slice(0, 50)
    setEmails(finalEmails)
    console.log(`✉️ Showing ${finalEmails.length} emails`)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadEmailsForCompanies(companies)
    setRefreshing(false)
  }

  const handleMarkAsRead = async (emailId: string) => {
    const result = await markEmailAsRead(emailId)
    if (result.success) {
      setEmails(emails.filter(email => email.id !== emailId))
    }
  }

  const handleConnect = async () => {
    const authUrl = await getGmailAuthUrl()
    window.location.href = authUrl
  }

  const unreadCount = emails.length

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
      >
        <Mail className="w-5 h-5" />
        {connected && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-white/10 overflow-hidden z-50">
          <div className="p-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              企業からの返信
            </h3>
            {connected && (
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition"
              >
                <RefreshCw className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                <p className="text-sm">読み込み中...</p>
              </div>
            ) : !connected ? (
              <div className="p-6 text-center">
                <div className="mb-4">
                  <Mail className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-semibold">
                    Gmail未連携です
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    企業からのメールを自動で確認できます
                  </p>
                </div>
                <button
                  onClick={handleConnect}
                  className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium text-sm transition"
                >
                  Googleアカウントで連携
                </button>
              </div>
            ) : unreadCount === 0 ? (
              <div className="p-6 text-center">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  企業からの返信はありません
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-white/10">
                {emails.slice(0, 10).map((email) => (
                  <div
                    key={email.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition"
                  >
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1 flex-1">
                        {email.subject || '(件名なし)'}
                      </h4>
                      <button
                        onClick={() => handleMarkAsRead(email.id)}
                        className="flex-shrink-0 p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded transition"
                        title="既読にする"
                      >
                        <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate mb-1">
                      {email.from}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-2 mb-1">
                      {email.snippet}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-600">
                      {new Date(email.timestamp * 1000).toLocaleString('ja-JP', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
