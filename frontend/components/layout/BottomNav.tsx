'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Building2, Calendar, PlusCircle } from 'lucide-react'

export default function BottomNav() {
  const pathname = usePathname()

  // ログインページなどでは表示しない
  if (pathname === '/login' || pathname === '/signup') {
    return null
  }

  const navItems = [
    { href: '/', label: 'ホーム', icon: Home },
    { href: '/companies', label: '企業', icon: Building2 },
    { href: '/companies/new', label: '追加', icon: PlusCircle },
    // 将来的にはカレンダー専用ページなどがあれば追加
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-gray-200 dark:border-white/10 z-50 pb-safe">
      <nav className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive 
                  ? 'text-indigo-600 dark:text-indigo-400' 
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
              }`}
            >
              <item.icon className={`w-6 h-6 ${isActive ? 'fill-current opacity-20' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

