import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  BarChart2,
  Rocket,
  Smile,
  Briefcase,
  Trophy,
  Sun,
  Moon,
  Sunrise,
  Calendar
} from "lucide-react";

import WeeklyCalendar from "@/components/features/dashboard/WeeklyCalendar";
import StatusChart from "@/components/features/dashboard/StatusChart";

const GOAL_COMPANIES = 30;

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 今週の日曜日を取得（カレンダー表示用）
  const today = new Date();
  const dayOfWeek = today.getDay();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - dayOfWeek);
  sunday.setHours(0, 0, 0, 0);

  // 直近のイベント取得（今週の開始日以降を取得してカレンダーに反映させる）
  const { data: upcomingEvents } = await supabase
    .from("events")
    .select("*, companies(name), userevents!inner(user_id)")
    .eq("userevents.user_id", user.id)
    .gte("start_time", sunday.toISOString())
    .order("start_time", { ascending: true })
    .limit(50);

  // 未完了タスク取得
  const { data: pendingTasks } = await supabase
    .from("tasks")
    .select("*, companies(name)")
    .eq("user_id", user.id) // 追加: 明示的にユーザーIDで絞り込み
    .eq("is_completed", false)
    .order("due_date", { ascending: true })
    .limit(5);

  // 企業ステータスの集計
  const { data: selections } = await supabase
    .from("usercompanyselections")
    .select("status")
    .eq("user_id", user.id);

  const totalCompanies = selections?.length || 0;

  // ステータス集計
  const statusCounts: Record<string, number> = {
    Interested: 0,
    Entry: 0,
    ES_Submit: 0,
    Interview: 0,
    Offer: 0,
    Rejected: 0,
  };

  selections?.forEach((s) => {
    if (s.status in statusCounts) {
      statusCounts[s.status]++;
    }
  });

  // リマインド用
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);

  const urgentEvents = upcomingEvents?.filter(event => {
    const eventDate = new Date(event.start_time);
    return eventDate <= tomorrow;
  }) || [];

  // 時間帯による挨拶とアイコン
  const hour = now.getHours();
  let greeting = "こんにちは";
  let GreetingIcon = Sun;

  if (hour >= 5 && hour < 11) {
    greeting = "おはようございます";
    GreetingIcon = Sunrise;
  } else if (hour >= 18 || hour < 5) {
    greeting = "こんばんは";
    GreetingIcon = Moon;
  }

  // Status Chart Data
  const statusChartData = [
    { name: 'エントリー', value: statusCounts.Entry, color: '#6366f1' },
    { name: '面接', value: statusCounts.Interview, color: '#f59e0b' },
    { name: '内定', value: statusCounts.Offer, color: '#10b981' },
    { name: 'その他', value: (statusCounts.Interested + statusCounts.ES_Submit + statusCounts.Rejected), color: '#9ca3af' }
  ].filter(d => d.value > 0)

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-7xl space-y-6">

      {/* ヒーローエリア */}
      <section className="bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 rounded-3xl p-6 shadow-md shadow-indigo-100 dark:shadow-none border border-indigo-50 dark:border-white/10 relative overflow-hidden group">

        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-xl md:text-3xl font-bold mb-3 text-indigo-950 dark:text-white flex items-center justify-center md:justify-start gap-3">
              <span className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-slate-800 p-2 rounded-full border border-indigo-200/50 dark:border-indigo-700/50 shadow-sm">
                <GreetingIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-600 dark:from-indigo-300 dark:to-purple-300">
                {greeting}、就活生さん！
              </span>
            </h1>
            <p className="text-gray-600 dark:text-slate-300 text-base mb-4 leading-relaxed max-w-xl">
              {urgentEvents.length > 0
                ? `明日にかけて${urgentEvents.length}件の予定があります。準備は万端ですか？`
                : "直近の緊急タスクはありません。自分のペースで進めましょう。"}
            </p>

            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-sm border border-gray-100 dark:border-white/10 flex items-center gap-3">
                <div className="bg-gradient-to-br from-indigo-100 to-blue-50 dark:from-indigo-900/50 dark:to-slate-800 p-1.5 rounded-lg">
                  <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-slate-400 block font-bold">エントリー</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white font-sans">{statusCounts.Entry}</span>
                  <span className="text-xs text-gray-500 ml-1">社</span>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-sm border border-gray-100 dark:border-white/10 flex items-center gap-3">
                <div className="bg-gradient-to-br from-amber-100 to-orange-50 dark:from-amber-900/50 dark:to-slate-800 p-1.5 rounded-lg">
                  <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-slate-400 block font-bold">内定</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white font-sans">{statusCounts.Offer}</span>
                  <span className="text-xs text-gray-500 ml-1">社</span>
                </div>
              </div>
            </div>
          </div>

          {/* 進捗グラフ (Recharts Pie Chart) */}
          <div className="flex-shrink-0 flex items-center justify-center bg-white/60 dark:bg-slate-800/40 rounded-full backdrop-blur-sm shadow-inner border border-white/50 dark:border-white/10 p-2">
            <StatusChart data={statusChartData} total={totalCompanies} goal={GOAL_COMPANIES} />
          </div>
        </div>
      </section>

      {/* リマインダーアラート */}
      {urgentEvents.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm animate-pulse-slow">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-bold text-red-800 dark:text-red-300">直近の予定 ({urgentEvents.length}件)</h3>
              <ul className="mt-1 space-y-1">
                {urgentEvents.map(e => (
                  <li key={e.id} className="text-sm text-red-700 dark:text-red-200">
                    <span className="font-mono font-bold mr-2">{new Date(e.start_time).getHours()}:{new Date(e.start_time).getMinutes().toString().padStart(2, '0')}</span>
                    {e.title}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左カラム */}
        <div className="lg:col-span-2 space-y-8">
          <WeeklyCalendar events={upcomingEvents || []} />

          <section>
            <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2 text-indigo-950">
              <Rocket className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> クイックアクセス
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link href="/companies/new" className="group p-4 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-200 rounded-2xl shadow-md shadow-indigo-100/50 dark:shadow-none hover:shadow-lg dark:hover:shadow-none border border-indigo-200 dark:border-white/20 hover:border-indigo-400 dark:hover:border-indigo-500/50 dark:hover:bg-slate-800/50 transition-all hover:-translate-y-1 flex flex-col items-center justify-center gap-3 h-32 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/40 dark:to-indigo-800/40 p-3 rounded-2xl group-hover:from-indigo-100 group-hover:to-indigo-200 dark:group-hover:from-indigo-900/60 dark:group-hover:to-indigo-800/60 transition-colors">
                  <Building2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="font-bold text-sm text-gray-700 dark:text-slate-200 group-hover:text-indigo-700 dark:group-hover:text-white transition-colors">企業追加</span>
              </Link>

              <Link href="/es" className="group p-4 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-200 rounded-2xl shadow-md shadow-blue-100/50 dark:shadow-none hover:shadow-lg dark:hover:shadow-none border border-blue-200 dark:border-white/20 hover:border-blue-400 dark:hover:border-blue-500/50 dark:hover:bg-slate-800/50 transition-all hover:-translate-y-1 flex flex-col items-center justify-center gap-3 h-32 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40 p-3 rounded-2xl group-hover:from-blue-100 group-hover:to-blue-200 dark:group-hover:from-blue-900/60 dark:group-hover:to-blue-800/60 transition-colors">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-bold text-sm text-gray-700 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-white transition-colors">ES管理</span>
              </Link>

              <Link href="/calendar" className="group p-4 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-200 rounded-2xl shadow-md shadow-amber-100/50 dark:shadow-none hover:shadow-lg dark:hover:shadow-none border border-amber-200 dark:border-white/20 hover:border-amber-400 dark:hover:border-amber-500/50 dark:hover:bg-slate-800/50 transition-all hover:-translate-y-1 flex flex-col items-center justify-center gap-3 h-32 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/40 dark:to-amber-800/40 p-3 rounded-2xl group-hover:from-amber-100 group-hover:to-amber-200 dark:group-hover:from-amber-900/60 dark:group-hover:to-amber-800/60 transition-colors">
                  <Calendar className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="font-bold text-sm text-gray-700 dark:text-slate-200 group-hover:text-amber-700 dark:group-hover:text-white transition-colors">カレンダー</span>
              </Link>

              <Link href="/analytics" className="group p-4 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-200 rounded-2xl shadow-md shadow-rose-100/50 dark:shadow-none hover:shadow-lg dark:hover:shadow-none border border-rose-200 dark:border-white/20 hover:border-rose-400 dark:hover:border-rose-500/50 dark:hover:bg-slate-800/50 transition-all hover:-translate-y-1 flex flex-col items-center justify-center gap-3 h-32 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                <div className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/40 dark:to-rose-800/40 p-3 rounded-2xl group-hover:from-rose-100 group-hover:to-rose-200 dark:group-hover:from-rose-900/60 dark:group-hover:to-rose-800/60 transition-colors">
                  <BarChart2 className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                </div>
                <span className="font-bold text-sm text-gray-700 dark:text-slate-200 group-hover:text-rose-700 dark:group-hover:text-white transition-colors">分析</span>
              </Link>
            </div>
          </section>
        </div>

        {/* 右カラム */}
        <div className="lg:col-span-1 space-y-8">
          <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-white/10 shadow-md shadow-indigo-50 dark:shadow-none relative overflow-hidden group hover:shadow-lg dark:hover:shadow-none transition-all hover:-translate-y-1">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
              <ClipboardList className="w-32 h-32 text-indigo-900" />
            </div>

            <div className="flex justify-between items-center mb-6 relative z-10">
              <h2 className="text-lg font-bold flex items-center gap-2 dark:text-white text-indigo-950">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> 今日のタスク
              </h2>
              <span className="text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 px-3 py-1 rounded-full font-bold font-mono">
                {pendingTasks ? pendingTasks.length : 0}
              </span>
            </div>

            <div className="relative z-10">
              {pendingTasks && pendingTasks.length > 0 ? (
                <div className="space-y-3">
                  {pendingTasks.map((task) => (
                    <Link href={`/companies/${task.company_id || '#'}`} key={task.id} className="block group/item">
                      <div className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-500 transition shadow-sm hover:shadow-md">
                        <div className="mt-1 w-5 h-5 rounded-full border-2 border-gray-300 dark:border-slate-500 group-hover/item:border-indigo-500 transition bg-white dark:bg-slate-800"></div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm text-gray-800 dark:text-gray-100 group-hover/item:text-indigo-700 dark:group-hover/item:text-indigo-300 transition truncate">{task.title}</div>
                          <div className="text-xs text-gray-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                            {task.companies?.name && (
                              <span className="truncate flex items-center gap-1 text-gray-500 dark:text-slate-400">
                                <Building2 className="w-3 h-3" /> {task.companies.name}
                              </span>
                            )}
                            {task.due_date && (
                              <span className={`flex items-center gap-1 ${new Date(task.due_date) < new Date() ? 'text-red-500 font-bold' : ''}`}>
                                <Clock className="w-3 h-3" /> <span className="font-mono">{new Date(task.due_date).toLocaleDateString()}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                  <Link href="/companies" className="block text-center text-xs text-gray-500 hover:text-indigo-600 font-medium mt-4 transition-colors">
                    すべてのタスクを確認する
                  </Link>
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="inline-block p-4 bg-teal-50 dark:bg-teal-900/20 rounded-full mb-3">
                    <Smile className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                  </div>
                  <p className="font-bold text-gray-800 dark:text-white">素晴らしい！</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">全てのタスクが完了しています。</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}