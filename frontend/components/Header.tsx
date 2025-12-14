'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()

  // ログインページやエラーページではヘッダーを表示しない
  if (pathname === '/login' || pathname === '/error') {
    return null
  }

  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-gray-800 hover:text-blue-600 transition">
          就活管理アプリ
        </Link>

        <nav className="flex gap-6 items-center">
          <Link 
            href="/" 
            className={`text-sm font-medium hover:text-blue-600 transition ${pathname === '/' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            ダッシュボード
          </Link>
          <Link 
            href="/companies" 
            className={`text-sm font-medium hover:text-blue-600 transition ${pathname.startsWith('/companies') ? 'text-blue-600' : 'text-gray-600'}`}
          >
            企業管理
          </Link>
          {/* 今後カレンダーなどを追加 */}
        </nav>

        <div className="flex gap-4 items-center">
           <form action="/auth/signout" method="post">
             <button className="text-sm text-gray-500 hover:text-red-500 transition">
               ログアウト
             </button>
          </form>
        </div>
      </div>
    </header>
  )
}

