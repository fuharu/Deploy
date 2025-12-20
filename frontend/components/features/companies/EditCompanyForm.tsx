'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateCompany } from '@/app/companies/[id]/actions'
import { useToast } from '@/components/providers/ToastProvider'

interface Company {
  id: string
  name: string
  url: string | null
  status: string
  motivation_level: number
}

export function EditCompanyForm({ company }: { company: Company }) {
  const [errors, setErrors] = useState<{ name?: string; url?: string; motivation_level?: string }>({})
  const router = useRouter()
  const { showSuccess, showError } = useToast()

  const validateUrl = (urlValue: string): boolean => {
    if (!urlValue) return true
    try {
      new URL(urlValue)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const newErrors: { name?: string; url?: string; motivation_level?: string } = {}

    const name = formData.get('name') as string
    if (!name.trim()) {
      newErrors.name = '企業名は必須です'
    }

    const urlValue = formData.get('url') as string
    if (urlValue && !validateUrl(urlValue)) {
      newErrors.url = '有効なURLを入力してください'
    }

    const motivationLevel = parseInt(formData.get('motivation_level') as string)
    if (isNaN(motivationLevel) || motivationLevel < 1 || motivationLevel > 5) {
      newErrors.motivation_level = '志望度は1〜5の範囲で入力してください'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      showError('入力内容を確認してください')
      return
    }

    try {
      await updateCompany(formData)
      showSuccess('企業情報を更新しました')
      router.push(`/companies/${company.id}`)
      router.refresh()
    } catch (error: any) {
      showError(error.message || '更新に失敗しました')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 border-2 border-gray-200 dark:border-gray-700 p-8 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
      <input type="hidden" name="id" value={company.id} />

      <label className="flex flex-col gap-2">
        <span className="font-medium text-gray-700 dark:text-gray-100">企業名 <span className="text-red-500 dark:text-red-400">*</span></span>
        <div>
          <input
            name="name"
            type="text"
            required
            defaultValue={company.name}
            className={`border rounded px-3 py-2 w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none ${errors.name ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-500'}`}
            onChange={() => {
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
            }}
          />
          {errors.name && (
            <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.name}</p>
          )}
        </div>
      </label>

      <label className="flex flex-col gap-2">
        <span className="font-medium text-gray-700 dark:text-gray-100">URL</span>
        <div>
          <input
            name="url"
            type="url"
            defaultValue={company.url || ''}
            className={`border rounded px-3 py-2 w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none ${errors.url ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-500'}`}
            onChange={(e) => {
              if (errors.url) setErrors((prev) => ({ ...prev, url: undefined }))
            }}
          />
          {errors.url && (
            <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.url}</p>
          )}
        </div>
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-2">
          <span className="font-medium text-gray-700 dark:text-gray-100">ステータス</span>
          <select
            name="status"
            defaultValue={company.status}
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
              name="motivation_level"
              type="number"
              min="1"
              max="5"
              defaultValue={company.motivation_level}
              className={`border rounded px-3 py-2 w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none ${errors.motivation_level ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-500'}`}
              onChange={() => {
                if (errors.motivation_level) setErrors((prev) => ({ ...prev, motivation_level: undefined }))
              }}
            />
            {errors.motivation_level && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.motivation_level}</p>
            )}
          </div>
        </label>
      </div>

      <button type="submit" className="bg-indigo-600 dark:bg-indigo-500 text-white py-2 rounded hover:bg-indigo-700 dark:hover:bg-indigo-600 transition font-medium shadow-sm">
        更新する
      </button>
    </form>
  )
}

