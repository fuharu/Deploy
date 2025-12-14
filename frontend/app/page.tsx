import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

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
            className="bg-gray-900 dark:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition text-sm flex items-center gap-2"
          >
            <span>+</span> 企業を追加
          </Link>
          <Link
            href="/companies"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition shadow-md text-sm flex items-center gap-2"
          >
             企業一覧へ
          </Link>
        </div>
      </div>

      {/* リマインダーアラート */}
      {urgentEvents.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 p-4 mb-8 rounded shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0 text-xl">⚠️</div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">直近の予定があります ({urgentEvents.length}件)</h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
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
                 🚀 クイックアクセス
              </h2>
              <div className="grid grid-cols-2 gap-4">
                  <Link href="/companies/new" className="group p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow hover:shadow-lg hover:scale-[1.02] transition flex flex-col items-center justify-center gap-2 h-24">
                      <span className="text-2xl group-hover:rotate-12 transition transform">🏢</span>
                      <span className="font-bold text-sm">企業を追加</span>
                  </Link>
                  
                  <Link href="/companies" className="group p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl shadow-sm hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition flex flex-col items-center justify-center gap-2 h-24">
                      <span className="text-2xl">📁</span>
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
                    📝 未完了タスク
                </h2>
                <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-400">
                    {pendingTasks ? pendingTasks.length : 0}件
                </span>
              </div>
              
              {pendingTasks && pendingTasks.length > 0 ? (
                <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[500px]">
                  {pendingTasks.map((task) => (
                    <Link href={`/companies/${task.company_id || '#'}`} key={task.id} className="block group">
                        <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded border border-transparent dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-500/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                            <div className="mt-1 w-4 h-4 rounded border-2 border-gray-400 dark:border-gray-400 group-hover:border-blue-500 transition"></div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition truncate">{task.title}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex flex-col gap-0.5">
                                    {task.companies?.name && (
                                        <span className="truncate flex items-center gap-1">
                                            🏢 {task.companies.name}
                                        </span>
                                    )}
                                    {task.due_date && (
                                        <span className={`flex items-center gap-1 ${new Date(task.due_date) < new Date() ? 'text-red-500 dark:text-red-400 font-bold' : ''}`}>
                                            ⏰ {new Date(task.due_date).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Link>
                  ))}
                  <div className="mt-auto pt-4 text-center">
                    <Link href="/companies" className="text-xs text-blue-500 hover:underline">
                        すべてのタスクを見る &rarr;
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-8 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                    <div className="text-5xl mb-3">🎉</div>
                    <p className="text-green-600 dark:text-green-400 font-bold mb-2">タスク完了！</p>
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
