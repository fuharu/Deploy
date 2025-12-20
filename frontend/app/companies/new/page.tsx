'use client'

import Link from 'next/link'
import { addCompany, searchCompany } from '../actions'
import { useState } from 'react'

export default function NewCompanyPage() {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [searchResults, setSearchResults] = useState<{ title: string, link: string, snippet: string }[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    if (!name.trim()) return
    setIsSearching(true)
    setSearchResults([])

    // 企業名だけでなく「公式」「採用」などをつけて検索精度を上げる工夫も可
    const results = await searchCompany(name)
    setSearchResults(results)
    setIsSearching(false)
  }

  const handleSelectUrl = (selectedUrl: string) => {
    setUrl(selectedUrl)
    setSearchResults([]) // 選択したら閉じる
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl min-h-screen bg-gray-50 dark:bg-gray-950">
      <Link href="/companies" className="text-indigo-500 dark:text-indigo-400 hover:underline mb-4 inline-block">
        &larr; 一覧に戻る
      </Link>
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">企業新規登録</h1>

      <form action={addCompany} className="flex flex-col gap-6 border-2 border-gray-200 dark:border-gray-700 p-8 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
        <label className="flex flex-col gap-2 relative">
          <span className="font-medium text-gray-700 dark:text-gray-100">企業名 <span className="text-red-500 dark:text-red-400">*</span></span>
          <div className="flex gap-2">
            <input
              name="name"
              type="text"
              required
              className="border border-gray-300 dark:border-gray-500 rounded px-3 py-2 flex-1 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none"
              placeholder="株式会社〇〇"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={isSearching || !name}
              className="bg-gray-100 dark:bg-slate-600 text-gray-700 dark:text-gray-100 px-4 py-2 rounded hover:bg-gray-200 dark:hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap border border-gray-300 dark:border-gray-500 font-medium"
            >
              {isSearching ? '検索中...' : 'URL自動検索'}
            </button>
          </div>
        </label>

        {/* 検索結果表示エリア */}
        {searchResults.length > 0 && (
          <div className="bg-indigo-50 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-700 rounded p-4 text-sm">
            <p className="font-bold mb-2 text-indigo-800 dark:text-indigo-200">検索結果 (URLを選択):</p>
            <ul className="flex flex-col gap-3">
              {searchResults.map((result, idx) => (
                <li key={idx} className="bg-white dark:bg-slate-700 p-2 rounded border border-indigo-100 dark:border-indigo-800 hover:shadow-md transition cursor-pointer" onClick={() => handleSelectUrl(result.link)}>
                  <div className="font-bold text-indigo-600 dark:text-indigo-300 truncate">{result.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-300 truncate">{result.link}</div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <label className="flex flex-col gap-2">
          <span className="font-medium text-gray-700 dark:text-gray-100">URL</span>
          <input
            name="url"
            type="url"
            className="border border-gray-300 dark:border-gray-500 rounded px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-2">
            <span className="font-medium text-gray-700 dark:text-gray-100">ステータス</span>
            <select name="status" className="border border-gray-300 dark:border-gray-500 rounded px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none cursor-pointer">
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
            <input name="motivation_level" type="number" min="1" max="5" defaultValue="3" className="border border-gray-300 dark:border-gray-500 rounded px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none" />
          </label>
        </div>

        <button type="submit" className="bg-indigo-600 dark:bg-indigo-500 text-white py-2 rounded hover:bg-indigo-700 dark:hover:bg-indigo-600 transition font-medium shadow-sm">
          登録する
        </button>
      </form>
    </div>
  )
}
