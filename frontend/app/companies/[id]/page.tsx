import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { deleteCompany } from './actions'
import { Calendar, CheckSquare, Coffee, FileText, Link as LinkIcon, Edit, Trash2 } from 'lucide-react'

import CompanyDetailTabs from '@/components/features/companies/CompanyDetailTabs'
import { DeleteCompanyButton } from '@/components/features/companies/DeleteCompanyButton'

export default async function CompanyDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  // paramsを非同期で解決する必要がある場合があるためawait
  const { id } = await params
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 企業情報と選択状況を取得
  const { data: selection } = await supabase
    .from('usercompanyselections')
    .select('*, companies!inner(*)')
    .eq('company_id', id)
    .eq('user_id', user.id)
    .single()

  if (!selection) notFound()

  const company = {
    ...selection.companies,
    status: selection.status,
    motivation_level: selection.motivation_level,
    id: selection.company_id
  }

  // 関連データを取得
  const { data: events } = await supabase
    .from('events')
    .select('*, userevents!inner(user_id)')
    .eq('company_id', id)
    .eq('userevents.user_id', user.id)
    .order('start_time', { ascending: true })

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('company_id', id)
    .eq('user_id', user.id)
    .order('due_date', { ascending: true })

  const { data: esList } = await supabase
    .from('es_entries')
    .select('*')
    .eq('company_id', id)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  // カフェ検索のデフォルト場所（直近の面接場所など）
  // 簡易的に、locationが入っている最初のイベントを使用
  const defaultLocation = events?.find(e => e.location)?.location || '';

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl">
      <div className="mb-6">
        <Link href="/companies" className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1 text-sm">
          &larr; 一覧に戻る
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-6 md:p-8 shadow-sm mb-8 transition-colors">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-3xl font-bold text-gray-400 dark:text-gray-500">
                {company.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 dark:text-white">{company.name}</h1>
                {company.url && (
                  <a href={company.url} target="_blank" rel="noopener noreferrer" className="text-indigo-500 dark:text-indigo-400 hover:underline text-sm flex items-center gap-1 mt-1">
                    <LinkIcon className="w-3 h-3" /> 公式サイト
                  </a>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 items-center mt-4">
              <span className={`px-3 py-1 rounded-full text-sm font-bold border ${company.status === 'Interested' ? 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800' :
                company.status === 'Entry' ? 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800' :
                  company.status === 'ES_Submit' ? 'bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-800/40 dark:text-violet-200 dark:border-violet-700' :
                    company.status === 'Interview' ? 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800' :
                      company.status === 'Offer' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800' :
                        'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                }`}>
                {(() => {
                  const statusLabels: Record<string, string> = {
                    Interested: '気になる',
                    Entry: 'エントリー',
                    ES_Submit: 'ES提出済',
                    Interview: '面接選考中',
                    Offer: '内定',
                    Rejected: 'お見送り',
                  }
                  return statusLabels[company.status as string] || company.status
                })()}
              </span>
              <span className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-1">
                志望度: <span className="text-yellow-500">{'★'.repeat(company.motivation_level)}</span>{'☆'.repeat(5 - company.motivation_level)}
              </span>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Link
              href={`/companies/${company.id}/edit`}
              className="flex-1 md:flex-none text-center bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm font-medium"
            >
              編集
            </Link>
            <div className="flex-1 md:flex-none">
              <DeleteCompanyButton companyId={company.id} companyName={company.name} />
            </div>
          </div>
        </div>
      </div>

      <CompanyDetailTabs
        companyId={company.id}
        events={events || []}
        tasks={tasks || []}
        esList={esList || []}
        defaultLocation={defaultLocation}
      />
    </div>
  )
}

