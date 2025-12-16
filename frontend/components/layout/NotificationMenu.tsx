'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, Check, X } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

type Notification = {
    id: string
    title: string
    content: string | null
    link: string | null
    is_read: boolean
    created_at: string
}

export default function NotificationMenu() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const menuRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    const fetchNotifications = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10)

        if (data) {
            setNotifications(data)
            setUnreadCount(data.filter(n => !n.is_read).length)
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

    // リアルタイム更新（任意実装だが今回はポーリングで代用してもOK）
    // Supabase Realtimeを使うとより即時性が増す

    const markAsRead = async (id: string) => {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id)
        // ローカルstate更新
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
        setUnreadCount(prev => Math.max(0, prev - 1))
    }

    const markAllAsRead = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false)
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        setUnreadCount(0)
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
                        <h3 className="font-bold text-sm text-gray-700 dark:text-gray-200">通知</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium flex items-center gap-1"
                            >
                                <Check className="w-3 h-3" />
                                すべて既読
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            <ul className="divide-y divide-gray-100 dark:divide-white/5">
                                {notifications.map(notification => (
                                    <li key={notification.id} className={`p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors ${notification.is_read ? 'opacity-60' : 'bg-indigo-50/30 dark:bg-indigo-900/10'}`}>
                                        <div className="flex gap-3 items-start">
                                            <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${notification.is_read ? 'bg-gray-300 dark:bg-slate-600' : 'bg-indigo-500'}`}></div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">{notification.title}</p>
                                                <p className="text-xs text-gray-500 dark:text-slate-400 mb-2 line-clamp-2">{notification.content}</p>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] text-gray-400 font-mono">
                                                        {new Date(notification.created_at).toLocaleDateString()} {new Date(notification.created_at).getHours()}:{new Date(notification.created_at).getMinutes().toString().padStart(2, '0')}
                                                    </span>
                                                    {notification.link && (
                                                        <Link
                                                            href={notification.link}
                                                            onClick={() => {
                                                                if (!notification.is_read) markAsRead(notification.id)
                                                                setIsOpen(false)
                                                            }}
                                                            className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
                                                        >
                                                            詳細を見る
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="p-8 text-center text-gray-400 dark:text-slate-500">
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">通知はありません</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

