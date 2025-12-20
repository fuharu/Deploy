'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { ToastContainer, Toast, ToastType } from '@/components/shared/Toast'

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void
    showSuccess: (message: string) => void
    showError: (message: string) => void
    showWarning: (message: string) => void
    showInfo: (message: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, [])

    const showToast = useCallback((message: string, type: ToastType = 'info', duration = 5000) => {
        const id = Math.random().toString(36).substring(2, 9)
        const newToast: Toast = { id, message, type, duration }
        setToasts((prev) => [...prev, newToast])
    }, [])

    const showSuccess = useCallback((message: string) => showToast(message, 'success'), [showToast])
    const showError = useCallback((message: string) => showToast(message, 'error', 7000), [showToast])
    const showWarning = useCallback((message: string) => showToast(message, 'warning'), [showToast])
    const showInfo = useCallback((message: string) => showToast(message, 'info'), [showToast])

    return (
        <ToastContext.Provider value={{ showToast, showSuccess, showError, showWarning, showInfo }}>
            {children}
            <ToastContainer toasts={toasts} onClose={removeToast} />
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}

