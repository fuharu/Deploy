'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  const pathname = usePathname()

  // ログインページやエラーページではヘッダーを表示しない
  if (pathname === '/login' || pathname === '/error') {
    return null
  }

  return (
    <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 sticky top-0 z-10 transition-colors">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        <Link href="/" className="text-lg md:text-xl font-bold text-gray-800 dark:text-white hover:text-blue-600 transition whitespace-nowrap mr-4">
          <span className="md:hidden">就活管理</span>
          <span className="hidden md:inline">就活管理アプリ</span>
        </Link>

        <nav className="flex gap-3 md:gap-6 items-center overflow-x-auto no-scrollbar">
          <Link 
            href="/" 
            className={`text-xs md:text-sm font-medium hover:text-blue-600 transition whitespace-nowrap ${pathname === '/' ? 'text-blue-600' : 'text-gray-600 dark:text-gray-300'}`}
          >
            ダッシュボード
          </Link>
          <Link 
            href="/companies" 
            className={`text-xs md:text-sm font-medium hover:text-blue-600 transition whitespace-nowrap ${pathname.startsWith('/companies') ? 'text-blue-600' : 'text-gray-600 dark:text-gray-300'}`}
          >
            企業管理
          </Link>
        </nav>

        <div className="flex gap-2 md:gap-4 items-center ml-4 shrink-0">
           <ThemeToggle />
           <form action="/auth/signout" method="post">
             <button className="text-xs md:text-sm text-gray-500 hover:text-red-500 transition whitespace-nowrap">
               ログアウト
             </button>
          </form>
        </div>
      </div>
    </header>
  )
}

