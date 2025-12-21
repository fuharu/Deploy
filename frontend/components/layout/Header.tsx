'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ThemeToggle from './ThemeToggle'
import NotificationMenu from './NotificationMenu'
import GmailMenu from './GmailMenu'

export default function Header() {
  const pathname = usePathname()

  // ログインページやエラーページではヘッダーを表示しない
  if (pathname === '/login' || pathname === '/signup' || pathname === '/error') {
    return null
  }

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b dark:border-white/10 fixed top-0 left-0 right-0 z-50 transition-colors shadow-sm">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        <Link href="/" className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 hover:opacity-80 transition whitespace-nowrap mr-4">
          <span className="md:hidden text-white text-xl font-bold">dai-job</span>
          <span className="hidden text-xl font-bold text-white md:inline">dai-job</span>
        </Link>

        <nav className="flex gap-3 md:gap-6 items-center overflow-x-auto no-scrollbar">
          <Link 
            href="/" 
            className={`text-xs md:text-sm font-medium hover:text-indigo-600 transition whitespace-nowrap ${pathname === '/' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-gray-600 dark:text-gray-400'}`}
          >
            ダッシュボード
          </Link>
          <Link 
            href="/companies" 
            className={`text-xs md:text-sm font-medium hover:text-indigo-600 transition whitespace-nowrap ${pathname.startsWith('/companies') ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-gray-600 dark:text-gray-400'}`}
          >
            志望企業
          </Link>
        </nav>

        <div className="flex gap-2 md:gap-4 items-center ml-4 shrink-0">
           <GmailMenu />
           <NotificationMenu />
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

