'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, Check, X, AlertTriangle, Clock } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

type Reminder = {
    id: string
    type: string
    company_id: string
    company_name: string
    message: string
    priority: 'high' | 'medium' | 'low'
    days_remaining?: number
    days_passed?: number
    deadline?: string
    created_at: string
}

export default function NotificationMenu() {
    const [reminders, setReminders] = useState<Reminder[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const menuRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    const fetchNotifications = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // バックエンドAPIからリマインダーを取得
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
        try {
            const response = await fetch(`${backendUrl}/api/reminders?user_id=${user.id}`)
            if (response.ok) {
                const data = await response.json()
                setReminders(data.reminders || [])
                // 優先度がhighまたはmediumのものを未読としてカウント
                setUnreadCount(data.reminders.filter((r: Reminder) => r.priority === 'high' || r.priority === 'medium').length)
            }
        } catch (error) {
            console.error('Failed to fetch reminders:', error)
        }
    }

    // 初回ロード時とポーリング（簡易的）
    useEffect(() => {
        fetchNotifications()

        // メニュー外クリックで閉じる
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-500'
            case 'medium': return 'bg-amber-500'
            case 'low': return 'bg-blue-500'
            default: return 'bg-gray-500'
        }
    }

    const getPriorityLabel = (priority: string) => {
        switch (priority) {
            case 'high': return '緊急'
            case 'medium': return '重要'
            case 'low': return '確認'
            default: return ''
        }
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-slate-800"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-white/10 z-50 overflow-hidden animation-fade-in">
                    <div className="p-3 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
                        <h3 className="font-bold text-sm text-gray-700 dark:text-gray-200">リマインダー</h3>
                        {unreadCount > 0 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                {unreadCount}件
                            </span>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {reminders.length > 0 ? (
                            <ul className="divide-y divide-gray-100 dark:divide-white/5">
                                {reminders.map(reminder => (
                                    <li key={reminder.id} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <div className="flex gap-3 items-start">
                                            <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${getPriorityColor(reminder.priority)}`}></div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                                        reminder.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                        reminder.priority === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                    }`}>
                                                        {getPriorityLabel(reminder.priority)}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">{reminder.company_name}</p>
                                                <p className="text-xs text-gray-600 dark:text-slate-400 mb-2">{reminder.message}</p>
                                                <div className="flex justify-between items-center">
                                                    {reminder.days_remaining !== undefined && (
                                                        <span className="text-[10px] text-red-500 dark:text-red-400 font-bold flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            残り{reminder.days_remaining}日
                                                        </span>
                                                    )}
                                                    {reminder.days_passed !== undefined && (
                                                        <span className="text-[10px] text-gray-400 font-mono">
                                                            {reminder.days_passed}日経過
                                                        </span>
                                                    )}
                                                    <Link
                                                        href={`/companies/${reminder.company_id}`}
                                                        onClick={() => setIsOpen(false)}
                                                        className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
                                                    >
                                                        詳細を見る
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="p-8 text-center text-gray-400 dark:text-slate-500">
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">リマインダーはありません</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

