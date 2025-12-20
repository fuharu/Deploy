'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

type SectionCardProps = {
  title: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}

export default function SectionCard({ 
  title, 
  children, 
  defaultOpen = false, 
  className = '' 
}: SectionCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={`bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-sm transition-colors overflow-hidden ${className}`}>
      {/* ヘッダー: スマホではアコーディオンのトリガー、PCではただの見出し */}
      <div 
        className="p-6 flex justify-between items-center cursor-pointer md:cursor-auto select-none md:select-text"
        onClick={() => setIsOpen(!isOpen)}
      >
         <div className="flex-1">{title}</div>
         
         {/* 開閉アイコン: PC (md以上) では非表示 */}
         <button 
            type="button"
            className="md:hidden text-gray-500 dark:text-gray-400 p-1"
            aria-label={isOpen ? "閉じる" : "開く"}
         >
            <ChevronDown 
              className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
         </button>
      </div>

      {/* コンテンツ: スマホではisOpen依存、PCでは常に表示 */}
      <div className={`
        ${isOpen ? 'block' : 'hidden'} 
        md:block 
        px-6 pb-6 
        animate-in fade-in slide-in-from-top-1 duration-200
        md:animate-none
      `}>
        {children}
      </div>
    </div>
  )
}

