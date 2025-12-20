'use client'

import { Search, Filter } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useDebounce } from '@/hooks/useDebounce' // これが必要だが、ないので作るか、直接useEffectで実装するか

export default function CompanySearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [status, setStatus] = useState(searchParams.get('status') || 'all')
  
  // Debounce logic for search query
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (query) {
        params.set('q', query)
      } else {
        params.delete('q')
      }
      
      // Reset page to 1 on search change
      params.set('page', '1')
      
      router.push(`/companies?${params.toString()}`)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, router]) // searchParamsを依存配列に入れるとループする可能性があるので注意

  // Status change handler
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus)
    const params = new URLSearchParams(searchParams.toString())
    if (newStatus && newStatus !== 'all') {
      params.set('status', newStatus)
    } else {
      params.delete('status')
    }
    params.set('page', '1')
    router.push(`/companies?${params.toString()}`)
  }

  const statuses = [
    { value: 'all', label: 'すべて' },
    { value: 'Interested', label: '気になる' },
    { value: 'Entry', label: 'エントリー' },
    { value: 'ES_Submit', label: 'ES提出済' },
    { value: 'Interview', label: '面接選考中' },
    { value: 'Offer', label: '内定' },
    { value: 'Rejected', label: 'お見送り' },
  ]

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/10 mb-6 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="企業名を検索..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
        />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
        <Filter className="w-5 h-5 text-gray-400 shrink-0 md:hidden" />
        {statuses.map((s) => (
          <button
            key={s.value}
            onClick={() => handleStatusChange(s.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              status === s.value
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}

