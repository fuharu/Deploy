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
    <div className="container mx-auto p-8">
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

      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold mb-2 dark:text-white">就活管理ダッシュボード</h1>
          <p className="text-gray-600 dark:text-gray-400">ようこそ、就活生さん</p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/companies"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-md"
          >
            企業管理へ
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {/* 週間スケジュール */}
        <WeeklyCalendar events={upcomingEvents || []} />

        {/* 未完了タスク */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-sm transition-colors">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-white">
            📝 未完了タスク
          </h2>
          
          {pendingTasks && pendingTasks.length > 0 ? (
             <div className="flex flex-col gap-3">
              {pendingTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded dark:border dark:border-gray-700">
                   <div className="w-3 h-3 rounded-full border-2 border-gray-400 dark:border-gray-500"></div>
                   <div className="flex-1">
                      <div className="font-medium dark:text-gray-200">{task.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {task.companies?.name ? `${task.companies.name} • ` : ''}
                        期限: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'なし'}
                      </div>
                   </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
                <div className="text-4xl mb-2">🎉</div>
                <p className="text-green-600 font-bold mb-2">素晴らしい！全てのタスクが完了しています</p>
                <p className="text-sm text-gray-500 mb-4">新しいタスクは各企業の詳細ページから追加できます</p>
                <Link href="/companies" className="text-blue-500 text-sm hover:underline">
                    企業一覧へ &rarr;
                </Link>
            </div>
          )}
        </section>
      </div>
      
      {/* クイックリンク */}
      <section className="mt-10">
        <h2 className="text-xl font-bold mb-4 dark:text-white">クイックアクセス</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/companies/new" className="group p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition flex flex-col items-center justify-center gap-3 h-36">
                <span className="text-4xl group-hover:rotate-12 transition transform">🏢</span>
                <span className="font-bold text-lg">企業を追加</span>
            </Link>
            
            <Link href="/companies" className="group p-6 bg-white dark:bg-gray-800 border-2 border-blue-100 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl shadow-sm hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition flex flex-col items-center justify-center gap-3 h-36">
                <span className="text-4xl">📝</span>
                <span className="font-bold text-lg">ES・タスク確認</span>
            </Link>

             <div className="p-6 bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 rounded-xl flex flex-col items-center justify-center gap-3 h-36 cursor-not-allowed">
                <span className="text-3xl">📊</span>
                <span className="font-bold">分析(準備中)</span>
            </div>
        </div>
      </section>
    </div>
  );
}
