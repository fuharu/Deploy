import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { deleteCompany } from './actions'

import EsList from '@/components/EsList'
import TodoList from '@/components/TodoList'
import EventList from '@/components/EventList'

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

  return (
    <div className="container mx-auto p-8">
      <div className="mb-4">
        <Link href="/companies" className="text-blue-500 hover:underline">
           &larr; 一覧に戻る
        </Link>
      </div>

      <div className="bg-white border rounded-lg p-8 shadow-sm mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
             <h1 className="text-3xl font-bold mb-2">{company.name}</h1>
             <div className="flex gap-2 items-center">
               <span className={`px-2 py-1 rounded text-sm font-medium ${
                    company.status === 'Interested' ? 'bg-yellow-100 text-yellow-800' :
                    company.status === 'Entry' ? 'bg-blue-100 text-blue-800' :
                    company.status === 'Rejected' ? 'bg-gray-100 text-gray-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {company.status}
               </span>
               <span className="text-gray-600">志望度: {'★'.repeat(company.motivation_level)}</span>
             </div>
             {company.url && (
                <a href={company.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline mt-2 block">
                  {company.url}
                </a>
             )}
          </div>
          <div className="flex gap-2">
             <Link 
                href={`/companies/${company.id}/edit`}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition"
             >
               編集
             </Link>
             <form action={deleteCompany}>
                <input type="hidden" name="id" value={company.id} />
                <button type="submit" className="bg-red-50 text-red-600 px-4 py-2 rounded hover:bg-red-100 transition">
                  削除
                </button>
             </form>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左カラム: イベント・タスク */}
        <div className="flex flex-col gap-8">
          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">イベント・日程</h2>
             <EventList 
               companyId={company.id}
               initialEvents={events || []}
             />
          </div>

          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">タスク (Todo)</h2>
             <TodoList 
                companyId={company.id}
                initialTasks={tasks || []}
             />
          </div>
        </div>

        {/* 右カラム: ES・メモ */}
        <div className="flex flex-col gap-8">
           <div className="bg-white border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">エントリーシート (ES)</h2>
             <EsList 
               companyId={company.id} 
               initialEsList={esList || []} // Type assertion might be needed if types don't match perfectly, but let's try
             />
          </div>
        </div>
      </div>
    </div>
  )
}

