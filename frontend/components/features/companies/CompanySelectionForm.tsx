'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, ExternalLink, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react'
import { useToast } from '@/components/providers/ToastProvider'

interface Company {
  id: string
  name: string
  url: string | null
  address: string | null
  industry: number | null
}

interface Industry {
  id: number
  industries: string
}

interface CompanySelectionFormProps {
  registeredCompanyIds: string[]
}

const ITEMS_PER_PAGE = 10

export function CompanySelectionForm({ registeredCompanyIds }: CompanySelectionFormProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('')
  const [status, setStatus] = useState('Interested')
  const [motivationLevel, setMotivationLevel] = useState(3)
  const [errors, setErrors] = useState<{ company?: string; motivation_level?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [companies, setCompanies] = useState<Company[]>([])
  const [industries, setIndustries] = useState<Industry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // フィルタリング状態
  const [selectedIndustry, setSelectedIndustry] = useState<number | 'all'>('all')

  const router = useRouter()
  const { showSuccess, showError } = useToast()

  // 企業一覧と業界一覧を取得
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // 企業一覧を取得
        const companiesResponse = await fetch('/api/companies/list')
        if (!companiesResponse.ok) throw new Error('企業一覧の取得に失敗しました')
        const companiesData = await companiesResponse.json()
        setCompanies(companiesData.companies || [])

        // 業界一覧を取得
        const industriesResponse = await fetch('/api/industries')
        if (!industriesResponse.ok) {
          const errorData = await industriesResponse.json().catch(() => ({}))
          console.error('業界一覧の取得に失敗しました:', errorData)
          showError(`業界データの取得に失敗しました: ${errorData.error || '不明なエラー'}`)
        } else {
          const industriesData = await industriesResponse.json()
          console.log('業界データ取得成功:', industriesData.industries?.length || 0, '件')
          setIndustries(industriesData.industries || [])
        }
      } catch (error: any) {
        showError(error.message || 'データの取得に失敗しました')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // フィルタリング（名前順でソート）
  const filteredAndSortedCompanies = useMemo(() => {
    let filtered = companies.filter(company =>
      !registeredCompanyIds.includes(company.id)
    )

    // 検索フィルタ
    if (searchQuery) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // 業界フィルタ
    if (selectedIndustry !== 'all') {
      filtered = filtered.filter(company => company.industry === selectedIndustry)
    }

    // 名前順でソート
    filtered.sort((a, b) => {
      return a.name.localeCompare(b.name, 'ja')
    })

    return filtered
  }, [companies, registeredCompanyIds, searchQuery, selectedIndustry])

  // ページネーション
  const totalPages = Math.ceil(filteredAndSortedCompanies.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedCompanies = filteredAndSortedCompanies.slice(startIndex, endIndex)

  // 検索やフィルタが変更されたら1ページ目に戻る
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedIndustry])

  const selectedCompany = companies.find(c => c.id === selectedCompanyId)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const newErrors: { company?: string; motivation_level?: string } = {}

    if (!selectedCompanyId) {
      newErrors.company = '企業を選択してください'
    }

    if (motivationLevel < 1 || motivationLevel > 5) {
      newErrors.motivation_level = '志望度は1〜5の範囲で入力してください'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      showError('入力内容を確認してください')
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('company_id', selectedCompanyId)
      formData.append('status', status)
      formData.append('motivation_level', motivationLevel.toString())

      const response = await fetch('/api/companies/select', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '登録に失敗しました')
      }

      showSuccess('企業を登録しました')
      router.push('/companies')
      router.refresh()
    } catch (error: any) {
      showError(error.message || '登録に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedIndustry('all')
  }

  const hasActiveFilters = searchQuery || selectedIndustry !== 'all'

  return (
    <div className="space-y-6">
      {/* 検索・フィルタバー */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border dark:border-gray-700 shadow-sm space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="企業名で検索..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">フィルタ:</span>
          </div>

          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
          >
            <option value="all">すべての業界</option>
            {industries && industries.length > 0 ? (
              industries.map((industry) => (
                <option key={industry.id} value={industry.id}>
                  {industry.industries}
                </option>
              ))
            ) : (
              <option disabled>業界データが取得できませんでした</option>
            )}
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition"
            >
              <X className="w-4 h-4" />
              クリア
            </button>
          )}
        </div>
      </div>

      {/* 企業一覧 */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-gray-700 shadow-sm">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            企業一覧 ({filteredAndSortedCompanies.length}件)
          </h2>
          {isLoading && (
            <div className="text-sm text-gray-500 dark:text-gray-400">読み込み中...</div>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              読み込み中...
            </div>
          ) : paginatedCompanies.length > 0 ? (
            <div className="divide-y dark:divide-gray-700">
              {paginatedCompanies.map((company) => (
                <button
                  key={company.id}
                  type="button"
                  onClick={() => {
                    setSelectedCompanyId(company.id)
                    setErrors((prev) => ({ ...prev, company: undefined }))
                  }}
                  className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition ${selectedCompanyId === company.id
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500 dark:border-indigo-400'
                    : ''
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${selectedCompanyId === company.id
                        ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                        }`}>
                        {company.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 dark:text-white">{company.name}</div>
                        {company.url && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1 mt-1">
                            <ExternalLink className="w-3 h-3" />
                            {new URL(company.url).hostname}
                          </div>
                        )}
                      </div>
                    </div>
                    {selectedCompanyId === company.id && (
                      <div className="text-indigo-600 dark:text-indigo-400 font-medium">✓ 選択中</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              {hasActiveFilters ? '検索結果が見つかりませんでした' : '登録可能な企業がありません'}
            </div>
          )}
        </div>

        {/* ページネーション */}
        {totalPages > 1 && (
          <div className="p-4 border-t dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {startIndex + 1} - {Math.min(endIndex, filteredAndSortedCompanies.length)} / {filteredAndSortedCompanies.length}件
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition ${currentPage === pageNum
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 登録フォーム */}
      {selectedCompany && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl p-6 border dark:border-gray-700 shadow-sm space-y-4">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
            <div className="text-sm font-medium text-indigo-900 dark:text-indigo-200 mb-2">選択中の企業</div>
            <div className="font-bold text-gray-900 dark:text-white">{selectedCompany.name}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-2">
              <span className="font-medium text-gray-700 dark:text-gray-100">ステータス</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border border-gray-300 dark:border-gray-500 rounded px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none cursor-pointer"
              >
                <option value="Interested">気になる</option>
                <option value="Entry">エントリー</option>
                <option value="ES_Submit">ES提出済</option>
                <option value="Interview">面接</option>
                <option value="Offer">内定</option>
                <option value="Rejected">お祈り</option>
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="font-medium text-gray-700 dark:text-gray-100">志望度 (1-5)</span>
              <div>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={motivationLevel}
                  onChange={(e) => {
                    const value = parseInt(e.target.value)
                    setMotivationLevel(value)
                    if (errors.motivation_level) setErrors((prev) => ({ ...prev, motivation_level: undefined }))
                  }}
                  className={`border rounded px-3 py-2 w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none ${errors.motivation_level ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-500'
                    }`}
                />
                {errors.motivation_level && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.motivation_level}</p>
                )}
              </div>
            </label>
          </div>

          {errors.company && (
            <p className="text-red-500 dark:text-red-400 text-sm">{errors.company}</p>
          )}

          <div className="flex gap-3">
            <Link
              href="/companies"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-indigo-600 dark:bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '登録中...' : '登録する'}
            </button>
          </div>
        </form>
      )}

      {!selectedCompany && !isLoading && filteredAndSortedCompanies.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-blue-800 dark:text-blue-200">
          企業を選択すると、ステータスと志望度を設定して登録できます。
        </div>
      )}
    </div>
  )
}

