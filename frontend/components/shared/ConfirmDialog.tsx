'use client'

import { useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmDialogProps {
    isOpen: boolean
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    onConfirm: () => void
    onCancel: () => void
    variant?: 'danger' | 'warning' | 'info'
}

export function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmText = '確認',
    cancelText = 'キャンセル',
    onConfirm,
    onCancel,
    variant = 'danger',
}: ConfirmDialogProps) {
    useEffect(() => {
        if (!isOpen) return

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onCancel()
            }
        }

        const handleEnter = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                onConfirm()
            }
        }

        document.addEventListener('keydown', handleEscape)
        document.addEventListener('keydown', handleEnter)
        document.body.style.overflow = 'hidden'

        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.removeEventListener('keydown', handleEnter)
            document.body.style.overflow = ''
        }
    }, [isOpen, onConfirm, onCancel])

    if (!isOpen) return null

    const variantStyles = {
        danger: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20',
        warning: 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20',
        info: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20',
    }

    const buttonStyles = {
        danger: 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600',
        warning: 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600',
        info: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600',
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
            onClick={onCancel}
        >
            <div
                className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full border-2 p-6 animate-in zoom-in-95"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${variantStyles[variant]}`}>
                        <AlertTriangle className={`w-5 h-5 ${variant === 'danger' ? 'text-red-600 dark:text-red-400' : variant === 'warning' ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{message}</p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={onCancel}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition ${buttonStyles[variant]}`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={onCancel}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                        aria-label="閉じる"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    )
}

