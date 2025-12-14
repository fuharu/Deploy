import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { deleteCompany } from './actions'
import { Calendar, CheckSquare, Coffee, FileText, Link as LinkIcon, Edit, Trash2 } from 'lucide-react'

import EsList from '@/components/EsList'
import TodoList from '@/components/TodoList'
import EventList from '@/components/EventList'
import CafeSearch from '@/components/CafeSearch'
import SectionCard from '@/components/SectionCard'

export default async function CompanyDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  // paramsを非同期で解決する必要がある場合があるためawait
  const { id } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: company, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !company) {
    notFound()
  }

  // Fetch ES entries
  const { data: esList } = await supabase
    .from('es_entries')
    .select('*')
    .eq('company_id', id)
    .order('created_at', { ascending: true })

  // Fetch Tasks
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('company_id', id)
    .order('created_at', { ascending: false })

  // Fetch Events
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('company_id', id)
    .order('start_time', { ascending: true })

  // カフェ検索のデフォルト場所（直近の面接場所など）
  // 簡易的に、locationが入っている最初のイベントを使用
  const defaultLocation = events?.find(e => e.location)?.location || '';

  return (
    <div className="container mx-auto p-8">
      <div className="mb-6">
        <Link href="/companies" className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1 text-sm">
           &larr; 一覧に戻る
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-8 shadow-sm mb-10 transition-colors">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
             <div className="flex items-center gap-4 mb-2">
                <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-3xl font-bold text-gray-400 dark:text-gray-500">
                    {company.name.charAt(0)}
                </div>
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">{company.name}</h1>
                     {company.url && (
                        <a href={company.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 dark:text-blue-400 hover:underline text-sm flex items-center gap-1 mt-1">
                          <LinkIcon className="w-3 h-3" /> 公式サイト
                        </a>
                     )}
                </div>
             </div>
             
             <div className="flex gap-3 items-center mt-2">
               <span className={`px-3 py-1 rounded-full text-sm font-bold border ${
                    company.status === 'Interested' ? 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800' :
                    company.status === 'Entry' ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' :
                    company.status === 'ES_Submit' ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-800/40 dark:text-blue-200 dark:border-blue-700' :
                    company.status === 'Interview' ? 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800' :
                    company.status === 'Offer' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' :
                    'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                  }`}>
                    {{
                        Interested: '気になる',
                        Entry: 'エントリー',
                        ES_Submit: 'ES提出済',
                        Interview: '面接選考中',
                        Offer: '内定',
                        Rejected: 'お見送り',
                    }[company.status] || company.status}
               </span>
               <span className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-1">
                 志望度: <span className="text-yellow-500">{'★'.repeat(company.motivation_level)}</span>{'☆'.repeat(5 - company.motivation_level)}
               </span>
             </div>
          </div>
          <div className="flex gap-2">
             <Link 
                href={`/companies/${company.id}/edit`}
                className="bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm font-medium"
             >
               編集
             </Link>
             <form action={deleteCompany}>
                <input type="hidden" name="id" value={company.id} />
                <button type="submit" className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition shadow-sm font-medium">
                  削除
                </button>
             </form>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
        {/* 左カラム: イベント・タスク */}
        <div className="flex flex-col gap-4 lg:gap-8">
          <SectionCard 
            title={<h2 className="text-xl font-bold flex items-center gap-2 dark:text-white"><Calendar className="w-6 h-6 text-blue-500" /> イベント・日程</h2>}
            defaultOpen={true}
          >
             <EventList 
               companyId={company.id}
               initialEvents={events || []}
             />
          </SectionCard>

          <SectionCard 
            title={<h2 className="text-xl font-bold flex items-center gap-2 dark:text-white"><CheckSquare className="w-6 h-6 text-green-500" /> タスク (Todo)</h2>}
            defaultOpen={true}
          >
             <TodoList 
                companyId={company.id}
                initialTasks={tasks || []}
             />
          </SectionCard>
        </div>

        {/* 右カラム: ES・メモ */}
        <div className="flex flex-col gap-4 lg:gap-8">
           <SectionCard 
             title={<h2 className="text-xl font-bold flex items-center gap-2 dark:text-white"><FileText className="w-6 h-6 text-indigo-500" /> エントリーシート (ES)</h2>}
             defaultOpen={false}
           >
             <EsList 
               companyId={company.id}
               initialEsList={esList || []} 
             />
          </SectionCard>

          <SectionCard 
            title={<h2 className="text-xl font-bold flex items-center gap-2 dark:text-white"><Coffee className="w-6 h-6 text-orange-500" /> 周辺カフェ検索</h2>}
            defaultOpen={false}
          >
            <CafeSearch defaultLocation={defaultLocation} />
          </SectionCard>
        </div>
      </div>
    </div>
  )
}

