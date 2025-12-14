import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function CompaniesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: companies, error } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
      console.error(error)
      return <div>Error loading companies</div>
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">企業管理</h1>
        <Link 
          href="/companies/new" 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          新規登録
        </Link>
      </div>

      {companies && companies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => {
             const getStatusBadge = (status: string) => {
                const styles = {
                    Interested: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                    Entry: 'bg-blue-50 text-blue-600 border-blue-200',
                    ES_Submit: 'bg-blue-100 text-blue-800 border-blue-300',
                    Interview: 'bg-orange-100 text-orange-800 border-orange-200',
                    Offer: 'bg-green-100 text-green-800 border-green-200',
                    Rejected: 'bg-gray-100 text-gray-500 border-gray-200',
                }[status] || 'bg-gray-100 text-gray-800'
                
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
              <div className="border rounded-xl p-5 hover:shadow-lg transition bg-white h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-50 border flex items-center justify-center text-xl font-bold text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition">
                          {company.name.charAt(0)}
                      </div>
                      <div>
                          <h2 className="text-lg font-bold text-gray-900 line-clamp-1">{company.name}</h2>
                          <div className="text-xs text-gray-500">
                             志望度: <span className="text-yellow-500">{'★'.repeat(company.motivation_level)}</span>{'☆'.repeat(5 - company.motivation_level)}
                          </div>
                      </div>
                  </div>
                </div>
                
                <div className="mt-auto flex justify-between items-center">
                    {getStatusBadge(company.status)}
                    {company.url && (
                        <div className="text-xs text-gray-400 truncate max-w-[150px]">
                            {new URL(company.url).hostname}
                        </div>
                    )}
                </div>
              </div>
            </Link>
          )})}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          登録されている企業はありません。<br/>
          右上のボタンから追加してください。
        </div>
      )}
    </div>
  )
}

