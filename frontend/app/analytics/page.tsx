import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import StatusChart from '@/components/features/dashboard/StatusChart'
import ActivityChart from '@/components/features/dashboard/ActivityChart'
import { ProgressChart } from '@/components/features/dashboard/ProgressChart'
import { BarChart3, TrendingUp, Target, Calendar as CalendarIcon } from 'lucide-react'

const GOAL_COMPANIES = 30

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 企業ステータスの集計
  const { data: selections } = await supabase
    .from('usercompanyselections')
    .select('status, created_at')
    .eq('user_id', user.id)

  const totalCompanies = selections?.length || 0

  const statusCounts: Record<string, number> = {
    Interested: 0,
    Entry: 0,
    ES_Submit: 0,
    Interview: 0,
    Offer: 0,
    Rejected: 0,
  }

  selections?.forEach((s) => {
    if (s.status in statusCounts) {
      statusCounts[s.status]++
    }
  })

  // Activity Chart Data (Last 7 days)
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })

  const startDate = last7Days[0]
  const { data: weekEvents } = await supabase
    .from('events')
    .select('start_time, userevents!inner(user_id)')
    .eq('userevents.user_id', user.id)
    .gte('start_time', startDate)

  const { data: weekEs } = await supabase
    .from('es_entries')
    .select('submitted_at')
    .eq('user_id', user.id)
    .gte('submitted_at', startDate)

  const activityData = last7Days.map(date => {
    const eventCount = weekEvents?.filter(e => e.start_time.startsWith(date)).length || 0
    const esCount = weekEs?.filter(e => e.submitted_at?.startsWith(date)).length || 0
    return {
      date: date.slice(5).replace('-', '/'), // MM/DD
      events: eventCount,
      es: esCount
    }
  })

  // Progress Chart Data (Last 30 days)
  const last30Days = [...Array(30)].map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    return d.toISOString().split('T')[0]
  })

  const { data: allSelections } = await supabase
    .from('usercompanyselections')
    .select('created_at')
    .eq('user_id', user.id)
    .gte('created_at', last30Days[0])

  const progressData = last30Days.map(date => {
    const count = allSelections?.filter(s => s.created_at.startsWith(date)).length || 0
    return {
      date: date.slice(5).replace('-', '/'), // MM/DD
      count
    }
  })

  // Status Chart Data
  const statusChartData = [
    { name: 'エントリー', value: statusCounts.Entry, color: '#6366f1' },
    { name: '面接', value: statusCounts.Interview, color: '#f59e0b' },
    { name: '内定', value: statusCounts.Offer, color: '#10b981' },
    { name: 'その他', value: (statusCounts.Interested + statusCounts.ES_Submit + statusCounts.Rejected), color: '#9ca3af' }
  ].filter(d => d.value > 0)

  // 目標達成率
  const goalProgress = Math.min((totalCompanies / GOAL_COMPANIES) * 100, 100)

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8 dark:text-white flex items-center gap-3">
        <BarChart3 className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        分析・統計
      </h1>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 dark:bg-indigo-900/40 p-3 rounded-lg">
              <Target className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">登録企業数</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalCompanies}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">目標: {GOAL_COMPANIES}社</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full transition-all"
                style={{ width: `${goalProgress}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{goalProgress.toFixed(1)}% 達成</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 dark:bg-emerald-900/40 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">内定数</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{statusCounts.Offer}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">社</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 dark:bg-amber-900/40 p-3 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">面接中</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{statusCounts.Interview}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">社</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">エントリー</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{statusCounts.Entry}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">社</div>
            </div>
          </div>
        </div>
      </div>

      {/* チャート */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border dark:border-gray-700 shadow-sm">
          <h2 className="text-lg font-bold mb-4 dark:text-white">ステータス分布</h2>
          <StatusChart data={statusChartData} total={totalCompanies} goal={GOAL_COMPANIES} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border dark:border-gray-700 shadow-sm">
          <h2 className="text-lg font-bold mb-4 dark:text-white">今週の活動量</h2>
          <ActivityChart data={activityData} />
        </div>
      </div>

      <ProgressChart data={progressData} />
    </div>
  )
}

