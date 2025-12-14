import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, Building2, Calendar, CheckCircle2, ClipboardList, Clock, FileText, BarChart2, Rocket, Plus } from "lucide-react";

import WeeklyCalendar from "@/components/WeeklyCalendar";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // ログインしていない場合はLP的な表示、またはログインへリダイレクト
    // 今回はシンプルにリダイレクト
    redirect("/login");
  }

  // 直近のイベント取得
  const { data: upcomingEvents } = await supabase
    .from("events")
    .select("*, companies(name)")
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true })
    .limit(20); // 今週分くらい取得できるように少し多めに

  // 未完了タスク取得
  const { data: pendingTasks } = await supabase
    .from("tasks")
    .select("*, companies(name)")
    .eq("is_completed", false)
    .order("due_date", { ascending: true })
    .limit(5);

  // リマインド用：明日または今日のイベントを抽出
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);

  const urgentEvents = upcomingEvents?.filter(event => {
    const eventDate = new Date(event.start_time);
    return eventDate <= tomorrow;
  }) || [];

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-7xl">
      {/* ヘッダーエリア */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 dark:text-white">就活管理ダッシュボード</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
            次のアクションを確認しましょう
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/companies/new"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition shadow-sm text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> 企業を追加
          </Link>
          <Link
            href="/companies"
            className="bg-white border border-gray-300 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm text-sm flex items-center gap-2"
          >
             企業一覧へ
          </Link>
        </div>
      </div>

      {/* リマインダーアラート */}
      {urgentEvents.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 p-4 mb-8 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0 text-xl">
               <AlertTriangle className="w-5 h-5 text-gray-800 dark:text-gray-200" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">直近の予定があります ({urgentEvents.length}件)</h3>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                <ul className="list-disc pl-5 space-y-1">
                  {urgentEvents.map(event => (
                    <li key={event.id}>
                        <span className="font-bold">{new Date(event.start_time).toLocaleDateString()} {new Date(event.start_time).getHours()}:{new Date(event.start_time).getMinutes().toString().padStart(2, '0')}</span> - {event.title} ({event.companies?.name || '企業未定'})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* メイングリッド */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        
        {/* 左側: 週間スケジュール (2カラム分) */}
        <div className="lg:col-span-2 space-y-6">
           <WeeklyCalendar events={upcomingEvents || []} />
           
           {/* クイックリンク (ここに入れるか検討したが、カレンダーの下が良いかも) */}
           <section>
              <h2 className="text-lg font-bold mb-3 dark:text-white flex items-center gap-2">
                 <Rocket className="w-5 h-5 text-indigo-500" /> クイックアクセス
              </h2>
              <div className="grid grid-cols-2 gap-4">
                  <Link href="/companies/new" className="group p-4 bg-indigo-600 dark:bg-indigo-700 text-white rounded-xl shadow-sm hover:bg-indigo-700 dark:hover:bg-indigo-600 transition flex flex-col items-center justify-center gap-2 h-24">
                      <Building2 className="w-6 h-6 group-hover:scale-110 transition transform text-indigo-100 group-hover:text-white" />
                      <span className="font-bold text-sm">企業を追加</span>
                  </Link>
                  
                  <Link href="/companies" className="group p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition flex flex-col items-center justify-center gap-2 h-24">
                      <FileText className="w-6 h-6 text-indigo-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition" />
                      <span className="font-bold text-sm">ES・タスク管理</span>
                  </Link>
              </div>
           </section>
        </div>

        {/* 右側: 未完了タスク (1カラム分) */}
        <div className="lg:col-span-1">
            <section className="bg-white dark:bg-gray-800 p-5 rounded-xl border dark:border-gray-700 shadow-sm transition-colors h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2 dark:text-white">
                    <ClipboardList className="w-5 h-5 text-indigo-500" /> 未完了タスク
                </h2>
                <span className="text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 px-2 py-1 rounded">
                    {pendingTasks ? pendingTasks.length : 0}件
                </span>
              </div>
              
              {pendingTasks && pendingTasks.length > 0 ? (
                <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[500px]">
                  {pendingTasks.map((task) => (
                    <Link href={`/companies/${task.company_id || '#'}`} key={task.id} className="block group">
                        <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded border border-transparent dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-500/50 hover:bg-white dark:hover:bg-gray-700 transition">
                            <div className="mt-1 w-4 h-4 rounded border-2 border-gray-400 dark:border-gray-400 group-hover:border-indigo-500 transition"></div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition truncate">{task.title}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex flex-col gap-0.5">
                                    {task.companies?.name && (
                                        <span className="truncate flex items-center gap-1">
                                            <Building2 className="w-3 h-3" /> {task.companies.name}
                                        </span>
                                    )}
                                    {task.due_date && (
                                        <span className={`flex items-center gap-1 ${new Date(task.due_date) < new Date() ? 'text-red-600 dark:text-red-400 font-medium' : ''}`}>
                                            <Clock className="w-3 h-3" /> {new Date(task.due_date).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Link>
                  ))}
                  <div className="mt-auto pt-4 text-center">
                    <Link href="/companies" className="text-xs text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline">
                        すべてのタスクを見る &rarr;
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-8 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                    <div className="mb-3 p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
                        <CheckCircle2 className="w-8 h-8 text-indigo-500" />
                    </div>
                    <p className="text-indigo-700 dark:text-indigo-300 font-medium mb-2">タスク完了</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 px-4">
                        現在、未完了のタスクはありません。<br/>素晴らしい進捗です。
                    </p>
                </div>
              )}
            </section>
        </div>
      </div>
    </div>
  );
}
