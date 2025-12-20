'use client'

import Link from 'next/link'

interface Company {
  id: string
  name: string
  url: string | null
  status: string
  motivation_level: number
}

interface CompanyListProps {
  companies: Company[]
}

export function CompanyList({ companies }: CompanyListProps) {

  const getStatusBadge = (status: string) => {
    const styles = {
      Interested: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
      Entry: 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
      ES_Submit: 'bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-800/40 dark:text-violet-200 dark:border-violet-700',
      Interview: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
      Offer: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
      Rejected: 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
    }[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'

    const labels: { [key: string]: string } = {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {companies.map((company) => (
        <Link key={company.id} href={`/companies/${company.id}`} className="block group">
          <div className="border dark:border-gray-700 rounded-xl p-5 hover:shadow-lg transition bg-white dark:bg-gray-800 h-full flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-12 h-12 rounded-lg bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 flex items-center justify-center text-xl font-bold text-gray-400 dark:text-gray-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition">
                  {company.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
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
      ))}
    </div>
  )
}

