import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { MonthlyCalendar } from '@/components/features/calendar/MonthlyCalendar'

export default async function CalendarPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 今月のイベントを取得
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  const { data: events } = await supabase
    .from('events')
    .select('*, companies(name), userevents!inner(user_id)')
    .eq('userevents.user_id', user.id)
    .gte('start_time', startOfMonth.toISOString())
    .lte('start_time', endOfMonth.toISOString())
    .order('start_time', { ascending: true })

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">カレンダー</h1>
      <MonthlyCalendar events={events || []} />
    </div>
  )
}

