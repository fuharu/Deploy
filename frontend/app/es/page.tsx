import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, Building2, Calendar, CheckCircle2, Clock } from 'lucide-react'

export default async function ESPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // すべてのESエントリーを取得（企業情報も含む）
  const { data: esEntries } = await supabase
    .from('es_entries')
    .select('*, companies(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // ステータス別の集計
  const statusCounts = {
    Draft: esEntries?.filter(e => e.status === 'Draft').length || 0,
    Submitted: esEntries?.filter(e => e.status === 'Submitted').length || 0,
    total: esEntries?.length || 0,
  }

  // 企業別の集計
  const companyEsMap = new Map<string, { name: string; entries: any[] }>()
  esEntries?.forEach(entry => {
    const companyId = entry.company_id
    const companyName = (entry.companies as any)?.name || '不明'
    
    if (!companyEsMap.has(companyId)) {
      companyEsMap.set(companyId, { name: companyName, entries: [] })
    }
    companyEsMap.get(companyId)!.entries.push(entry)
  })

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">ES管理</h1>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 dark:bg-indigo-900/40 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">総ES数</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{statusCounts.total}</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 dark:bg-amber-900/40 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">下書き</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{statusCounts.Draft}</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 dark:bg-emerald-900/40 p-3 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">提出済</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{statusCounts.Submitted}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 企業別ES一覧 */}
      <div className="space-y-6">
        {Array.from(companyEsMap.entries()).map(([companyId, { name, entries }]) => (
          <div key={companyId} className="bg-white dark:bg-gray-800 rounded-xl p-6 border dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-lg font-bold text-gray-400 dark:text-gray-500">
                  {name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{name}</h2>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{entries.length}件のES</div>
                </div>
              </div>
              <Link
                href={`/companies/${companyId}`}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                企業詳細へ →
              </Link>
            </div>

            <div className="space-y-3">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="border dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {entry.status === 'Submitted' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <FileText className="w-4 h-4 text-gray-400" />
                      )}
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        entry.status === 'Submitted'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {entry.status === 'Submitted' ? '提出済' : '下書き'}
                      </span>
                      {entry.submitted_at && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          提出日: {new Date(entry.submitted_at).toLocaleDateString('ja-JP')}
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/companies/${companyId}`}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      編集
                    </Link>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 whitespace-pre-wrap">
                    {entry.content || <span className="text-gray-400 dark:text-gray-600 italic">内容未入力</span>}
                  </p>
                  {entry.file_url && (
                    <a
                      href={entry.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-2 inline-block"
                    >
                      ファイルを開く →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {companyEsMap.size === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
            <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">ESエントリーはまだありません</p>
            <Link
              href="/companies"
              className="text-indigo-600 dark:text-indigo-400 hover:underline mt-2 inline-block"
            >
              企業一覧からESを追加する →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

