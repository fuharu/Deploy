import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import CompanySearch from '@/components/features/companies/CompanySearch'

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>
}) {
  const supabase = await createClient()
  const resolvedSearchParams = await searchParams
  const page = Number(resolvedSearchParams.page) || 1
  const query = resolvedSearchParams.q || ''
  const status = resolvedSearchParams.status || 'all'
  
  const perPage = 12
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // クエリの構築
  let queryBuilder = supabase
    .from('usercompanyselections')
    .select('*, companies!inner(*)', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // 検索条件の適用
  if (query) {
    queryBuilder = queryBuilder.ilike('companies.name', `%${query}%`)
  }

  if (status && status !== 'all') {
    queryBuilder = queryBuilder.eq('status', status)
  }

  // ページネーションの適用と実行
  const { data: selections, count, error } = await queryBuilder.range(from, to)

  if (error) {
      console.error('Supabase Error:', JSON.stringify(error, null, 2))
      return <div>Error loading companies: {error.message}</div>
  }

  const totalPages = Math.ceil((count || 0) / perPage)

  // ページネーションリンク用のクエリパラメータ生成関数
  const getPageLink = (p: number) => {
      const params = new URLSearchParams()
      if (p > 1) params.set('page', p.toString())
      if (query) params.set('q', query)
      if (status && status !== 'all') params.set('status', status)
      const str = params.toString()
      return `/companies${str ? `?${str}` : ''}`
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold dark:text-white">企業管理</h1>
        <Link 
          href="/companies/new" 
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition shadow-sm"
        >
          新規登録
        </Link>
      </div>

      <CompanySearch />

      {selections && selections.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selections.map((selection: any) => {
               const company = {
                   ...selection.companies,
                   id: selection.company_id,
                   status: selection.status,
                   motivation_level: selection.motivation_level
               }

               const getStatusBadge = (status: string) => {
                  const styles = {
                      Interested: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
                      Entry: 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
                      ES_Submit: 'bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-800/40 dark:text-violet-200 dark:border-violet-700',
                      Interview: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
                      Offer: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
                      Rejected: 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
                  }[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                  
                  const labels: {[key:string]: string} = {
                      Interested: '気になる',
                      Entry: 'エントリー',
                      ES_Submit: 'ES提出済',
                      Interview: '面接選考中',
                      Offer: '内定',
                      Rejected: 'お見送り',
                  }

                  return (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${styles}`}>
                          {labels[status] || status}
                      </span>
                  )
               }

               return (
              <Link key={company.id} href={`/companies/${company.id}`} className="block group">
                <div className="border dark:border-gray-700 rounded-xl p-5 hover:shadow-lg transition bg-white dark:bg-gray-800 h-full flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 flex items-center justify-center text-xl font-bold text-gray-400 dark:text-gray-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition">
                            {company.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{company.name}</h2>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                               志望度: <span className="text-yellow-500">{'★'.repeat(company.motivation_level)}</span>{'☆'.repeat(5 - company.motivation_level)}
                            </div>
                        </div>
                    </div>
                  </div>
                  
                  <div className="mt-auto flex justify-between items-center">
                      {getStatusBadge(company.status)}
                      {company.url && (
                          <div className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[150px]">
                              {new URL(company.url).hostname}
                          </div>
                      )}
                  </div>
                </div>
              </Link>
            )})}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-10 gap-2 items-center">
              {page > 1 ? (
                <Link 
                  href={getPageLink(page - 1)} 
                  className="p-2 border dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-600 dark:text-gray-300"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Link>
              ) : (
                <span className="p-2 border dark:border-gray-700 rounded-lg text-gray-300 dark:text-gray-700 cursor-not-allowed">
                  <ChevronLeft className="w-5 h-5" />
                </span>
              )}
              
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 px-4">
                {page} / {totalPages}
              </span>

              {page < totalPages ? (
                <Link 
                  href={getPageLink(page + 1)} 
                  className="p-2 border dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-600 dark:text-gray-300"
                >
                  <ChevronRight className="w-5 h-5" />
                </Link>
              ) : (
                <span className="p-2 border dark:border-gray-700 rounded-lg text-gray-300 dark:text-gray-700 cursor-not-allowed">
                  <ChevronRight className="w-5 h-5" />
                </span>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p>条件に一致する企業は見つかりませんでした。</p>
          {(query || (status && status !== 'all')) && (
            <Link href="/companies" className="text-indigo-600 hover:underline mt-2 inline-block">
                検索条件をクリア
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
