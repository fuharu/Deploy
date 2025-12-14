import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { deleteCompany } from './actions'

import EsList from '@/components/EsList'
import TodoList from '@/components/TodoList'
import EventList from '@/components/EventList'
import CafeSearch from '@/components/CafeSearch'

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
        <Link href="/companies" className="text-gray-500 hover:text-gray-800 flex items-center gap-1 text-sm">
           &larr; 一覧に戻る
        </Link>
      </div>

      <div className="bg-white border rounded-xl p-8 shadow-sm mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
             <div className="flex items-center gap-4 mb-2">
                <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-3xl font-bold text-gray-400">
                    {company.name.charAt(0)}
                </div>
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900">{company.name}</h1>
                     {company.url && (
                        <a href={company.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm flex items-center gap-1 mt-1">
                          🔗 公式サイト
                        </a>
                     )}
                </div>
             </div>
             
             <div className="flex gap-3 items-center mt-2">
               <span className={`px-3 py-1 rounded-full text-sm font-bold border ${
                    company.status === 'Interested' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                    company.status === 'Entry' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                    company.status === 'ES_Submit' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                    company.status === 'Interview' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                    company.status === 'Offer' ? 'bg-green-100 text-green-800 border-green-200' :
                    'bg-gray-100 text-gray-500 border-gray-200'
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
               <span className="text-gray-600 text-sm flex items-center gap-1">
                 志望度: <span className="text-yellow-500">{'★'.repeat(company.motivation_level)}</span>{'☆'.repeat(5 - company.motivation_level)}
               </span>
             </div>
          </div>
          <div className="flex gap-2">
             <Link 
                href={`/companies/${company.id}/edit`}
                className="bg-white border text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition shadow-sm font-medium"
             >
               編集
             </Link>
             <form action={deleteCompany}>
                <input type="hidden" name="id" value={company.id} />
                <button type="submit" className="bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition shadow-sm font-medium">
                  削除
                </button>
             </form>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左カラム: イベント・タスク */}
        <div className="flex flex-col gap-8">
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">📅 イベント・日程</h2>
             <EventList 
               companyId={company.id}
               initialEvents={events || []}
             />
          </div>

          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">✅ タスク (Todo)</h2>
             <TodoList 
                companyId={company.id}
                initialTasks={tasks || []}
             />
          </div>
        </div>

        {/* 右カラム: ES・メモ */}
        <div className="flex flex-col gap-8">
           <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">📝 エントリーシート (ES)</h2>
             <EsList 
               companyId={company.id}
               initialEsList={esList || []} // Type assertion might be needed if types don't match perfectly, but let's try
             />
          </div>

          {/* カフェ検索は優先度低いため下部へ */}
          <CafeSearch defaultLocation={defaultLocation} />
        </div>
      </div>
    </div>
  )
}

