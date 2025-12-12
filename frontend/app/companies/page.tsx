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
          {companies.map((company) => (
            <Link key={company.id} href={`/companies/${company.id}`} className="block">
              <div className="border rounded-lg p-6 hover:shadow-lg transition bg-white">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold">{company.name}</h2>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    company.status === 'Interested' ? 'bg-yellow-100 text-yellow-800' :
                    company.status === 'Entry' ? 'bg-blue-100 text-blue-800' :
                    company.status === 'Rejected' ? 'bg-gray-100 text-gray-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {company.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                   志望度: {'★'.repeat(company.motivation_level)}{'☆'.repeat(5 - company.motivation_level)}
                </div>
                {company.url && (
                    <div className="text-sm text-blue-500 truncate">{company.url}</div>
                )}
              </div>
            </Link>
          ))}
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

