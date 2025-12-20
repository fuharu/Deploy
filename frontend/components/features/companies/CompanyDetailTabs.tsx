'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Calendar, CheckSquare, FileText, MessageSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import EventList from './EventList'
import TodoList from './TodoList'
import EsList from './EsList'
import ReflectionList from './ReflectionList'

type Props = {
  companyId: string
  events: any[]
  tasks: any[]
  esList: any[]
  defaultLocation: string
}

export default function CompanyDetailTabs({ companyId, events, tasks, esList, defaultLocation }: Props) {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(tabParam || 'events')

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const tabs = [
    { id: 'events', label: 'イベント・日程', icon: Calendar, color: 'text-indigo-500' },
    { id: 'reflections', label: '振り返りログ', icon: MessageSquare, color: 'text-blue-500' },
    { id: 'tasks', label: 'タスク (Todo)', icon: CheckSquare, color: 'text-emerald-500' },
    { id: 'es', label: 'ES・提出書類', icon: FileText, color: 'text-violet-500' },
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden min-h-[600px]">
       <div className="flex border-b border-gray-100 dark:border-gray-700 overflow-x-auto no-scrollbar bg-gray-50/50 dark:bg-gray-800/50">
         {tabs.map((tab) => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all whitespace-nowrap font-medium text-sm flex-1 justify-center relative ${
               activeTab === tab.id
                 ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800'
                 : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
             }`}
           >
             <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? tab.color : 'text-gray-400'}`} />
             {tab.label}
             {activeTab === tab.id && (
                <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
                />
             )}
           </button>
         ))}
       </div>

       <div className="p-6">
         <AnimatePresence mode="wait">
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
            >
                {activeTab === 'events' && (
                <div className="max-w-3xl mx-auto">
                    <EventList companyId={companyId} initialEvents={events} />
                </div>
                )}
                {activeTab === 'reflections' && (
                <div className="max-w-3xl mx-auto">
                    <ReflectionList events={events} />
                </div>
                )}
                {activeTab === 'tasks' && (
                <div className="max-w-3xl mx-auto">
                    <TodoList companyId={companyId} initialTasks={tasks} />
                </div>
                )}
                {activeTab === 'es' && (
                <div className="max-w-3xl mx-auto">
                    <EsList companyId={companyId} initialEsList={esList} />
                </div>
                )}
            </motion.div>
         </AnimatePresence>
       </div>
    </div>
  )
}

