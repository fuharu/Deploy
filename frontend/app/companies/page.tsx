import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import CompanySearch from '@/components/features/companies/CompanySearch'
import { CompanyList } from '@/components/features/companies/CompanyList'

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: { page?: string; q?: string; status?: string; motivation?: string } | Promise<{ page?: string; q?: string; status?: string; motivation?: string }>
}) {
  const supabase = await createClient()
  const resolvedSearchParams = searchParams instanceof Promise ? await searchParams : searchParams
  const page = Number(resolvedSearchParams.page) || 1
  const query = resolvedSearchParams.q || ''
  const status = resolvedSearchParams.status || 'all'
  const motivation = resolvedSearchParams.motivation || 'all'

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

  if (motivation && motivation !== 'all') {
    queryBuilder = queryBuilder.eq('motivation_level', parseInt(motivation))
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
    if (motivation && motivation !== 'all') params.set('motivation', motivation)
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
          <CompanyList
            companies={selections.map((selection: any) => ({
              ...selection.companies,
              id: selection.company_id,
              status: selection.status,
              motivation_level: selection.motivation_level
            }))}
          />

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
          {(query || (status && status !== 'all') || (motivation && motivation !== 'all')) && (
            <Link href="/companies" className="text-indigo-600 hover:underline mt-2 inline-block">
              検索条件をクリア
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
