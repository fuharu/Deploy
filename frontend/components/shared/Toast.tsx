'use client'

import { useEffect, useState } from 'react'
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
    id: string
    message: string
    type: ToastType
    duration?: number
}

interface ToastProps {
    toast: Toast
    onClose: (id: string) => void
}

function ToastItem({ toast, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(toast.id)
        }, toast.duration || 5000)

        return () => clearTimeout(timer)
    }, [toast.id, toast.duration, onClose])

    const icons = {
        success: <CheckCircle2 className="w-5 h-5" />,
        error: <AlertCircle className="w-5 h-5" />,
        warning: <AlertTriangle className="w-5 h-5" />,
        info: <Info className="w-5 h-5" />,
    }

    const styles = {
        success: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200',
        error: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
        warning: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200',
        info: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
    }

    return (
        <div
            className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-in slide-in-from-left-full ${styles[toast.type]}`}
            role="alert"
        >
            <div className="flex-shrink-0 mt-0.5">
                {icons[toast.type]}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium break-words">{toast.message}</p>
            </div>
            <button
                onClick={() => onClose(toast.id)}
                className="flex-shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity"
                aria-label="閉じる"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    )
}

export function ToastContainer({ toasts, onClose }: { toasts: Toast[]; onClose: (id: string) => void }) {
    if (toasts.length === 0) return null

    return (
        <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 max-w-sm w-full">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onClose={onClose} />
            ))}
        </div>
    )
}

