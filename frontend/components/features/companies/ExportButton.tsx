'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { useToast } from '@/components/providers/ToastProvider'

interface ExportButtonProps {
  status?: string
  startDate?: string
  endDate?: string
}

export function ExportButton({ status, startDate, endDate }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const { showSuccess, showError } = useToast()

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const params = new URLSearchParams()
      if (status) params.set('status', status)
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)

      const response = await fetch(`/api/export/companies?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('エクスポートに失敗しました')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `companies_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      showSuccess('CSVファイルをダウンロードしました')
    } catch (error: any) {
      showError(error.message || 'エクスポートに失敗しました')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-2 bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Download className="w-4 h-4" />
      {isExporting ? 'エクスポート中...' : 'CSVエクスポート'}
    </button>
  )
}

