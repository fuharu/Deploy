'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Edit3 } from 'lucide-react'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useToast } from '@/components/providers/ToastProvider'

interface BulkActionsProps {
  selectedIds: string[]
  onClearSelection: () => void
}

export function BulkActions({ selectedIds, onClearSelection }: BulkActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { showSuccess, showError } = useToast()

  const handleBulkDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch('/api/companies/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      })

      if (!response.ok) {
        throw new Error('削除に失敗しました')
      }

      showSuccess(`${selectedIds.length}件の企業を削除しました`)
      onClearSelection()
      router.refresh()
    } catch (error: any) {
      showError(error.message || '削除に失敗しました')
    } finally {
      setIsDeleting(false)
      setIsOpen(false)
    }
  }

  if (selectedIds.length === 0) return null

  return (
    <>
      <div className="fixed bottom-20 md:bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg p-4 flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {selectedIds.length}件選択中
        </span>
        <button
          onClick={() => setIsOpen(true)}
          disabled={isDeleting}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4" />
          {isDeleting ? '削除中...' : '一括削除'}
        </button>
        <button
          onClick={onClearSelection}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition"
        >
          キャンセル
        </button>
      </div>
      <ConfirmDialog
        isOpen={isOpen}
        title="企業を一括削除しますか？"
        message={`選択した${selectedIds.length}件の企業を削除します。この操作は取り消せません。`}
        confirmText="削除する"
        cancelText="キャンセル"
        onConfirm={handleBulkDelete}
        onCancel={() => setIsOpen(false)}
        variant="danger"
      />
    </>
  )
}

