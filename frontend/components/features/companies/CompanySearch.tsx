'use client'

import { Search, Filter, X, Clock } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function CompanySearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [status, setStatus] = useState(searchParams.get('status') || 'all')
  const [motivationLevel, setMotivationLevel] = useState(searchParams.get('motivation') || 'all')
  const [showHistory, setShowHistory] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  
  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('company-search-history')
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved))
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, [])

  // Save search query to history
  const saveToHistory = (searchQuery: string) => {
    if (!searchQuery.trim()) return
    
    const updated = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 10)
    setSearchHistory(updated)
    localStorage.setItem('company-search-history', JSON.stringify(updated))
  }

  // Debounce logic for search query
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (query) {
        params.set('q', query)
        saveToHistory(query)
      } else {
        params.delete('q')
      }
      
      if (motivationLevel && motivationLevel !== 'all') {
        params.set('motivation', motivationLevel)
      } else {
        params.delete('motivation')
      }
      
      // Reset page to 1 on search change
      params.set('page', '1')
      
      router.push(`/companies?${params.toString()}`)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, motivationLevel, router])

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

  const handleMotivationChange = (level: string) => {
    setMotivationLevel(level)
    const params = new URLSearchParams(searchParams.toString())
    if (level && level !== 'all') {
      params.set('motivation', level)
    } else {
      params.delete('motivation')
    }
    params.set('page', '1')
    router.push(`/companies?${params.toString()}`)
  }

  const clearSearch = () => {
    setQuery('')
    setStatus('all')
    setMotivationLevel('all')
    router.push('/companies')
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
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/10 mb-6 space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowHistory(true)}
            placeholder="企業名を検索..."
            className="block w-full pl-10 pr-10 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
          
          {/* Search History Dropdown */}
          {showHistory && searchHistory.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {searchHistory.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(item)
                    setShowHistory(false)
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  <Clock className="w-4 h-4 text-gray-400" />
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
        {(query || status !== 'all' || motivationLevel !== 'all') && (
          <button
            onClick={clearSearch}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 whitespace-nowrap"
          >
            クリア
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-500 dark:text-gray-400">ステータス:</span>
        </div>
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
        
        <div className="flex items-center gap-2 ml-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">志望度:</span>
          <select
            value={motivationLevel}
            onChange={(e) => handleMotivationChange(e.target.value)}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="all">すべて</option>
            <option value="5">★★★★★</option>
            <option value="4">★★★★☆</option>
            <option value="3">★★★☆☆</option>
            <option value="2">★★☆☆☆</option>
            <option value="1">★☆☆☆☆</option>
          </select>
        </div>
      </div>
    </div>
  )
}

