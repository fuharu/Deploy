'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteCompany } from '@/app/companies/[id]/actions'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useToast } from '@/components/providers/ToastProvider'

export function DeleteCompanyButton({ companyId, companyName }: { companyId: string; companyName: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()
    const { showSuccess, showError } = useToast()

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            const formData = new FormData()
            formData.append('id', companyId)
            await deleteCompany(formData)
            showSuccess(`${companyName}を削除しました`)
            router.push('/companies')
            router.refresh()
        } catch (error) {
            showError('削除に失敗しました')
            console.error('Delete error:', error)
        } finally {
            setIsDeleting(false)
            setIsOpen(false)
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="w-full bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition shadow-sm font-medium"
                disabled={isDeleting}
            >
                {isDeleting ? '削除中...' : '削除'}
            </button>
            <ConfirmDialog
                isOpen={isOpen}
                title="企業を削除しますか？"
                message={`「${companyName}」を削除します。この操作は取り消せません。`}
                confirmText="削除する"
                cancelText="キャンセル"
                onConfirm={handleDelete}
                onCancel={() => setIsOpen(false)}
                variant="danger"
            />
        </>
    )
}

