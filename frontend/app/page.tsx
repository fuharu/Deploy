import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

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
    .limit(5);

  // 未完了タスク取得
  const { data: pendingTasks } = await supabase
    .from("tasks")
    .select("*, companies(name)")
    .eq("is_completed", false)
    .order("due_date", { ascending: true })
    .limit(5);

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold mb-2">就活管理ダッシュボード</h1>
          <p className="text-gray-600">ようこそ、就活生さん</p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/companies"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-md"
          >
            企業管理へ
          </Link>
          <form action="/auth/signout" method="post">
             <button className="text-gray-600 px-4 py-3 hover:text-gray-900">
               ログアウト
             </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 直近の予定 */}
        <section className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              📅 直近の予定
            </h2>
            <Link href="/calendar" className="text-sm text-blue-500 hover:underline">
              カレンダーを見る &rarr;
            </Link>
          </div>
          
          {upcomingEvents && upcomingEvents.length > 0 ? (
            <div className="flex flex-col gap-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                  <div className="font-bold">{event.title}</div>
                  <div className="text-sm text-gray-600">
                    {new Date(event.start_time).toLocaleString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    <span className="mx-2 text-gray-300">|</span>
                    {event.companies?.name || '企業未定'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 py-4 text-center">予定はありません 🎉</p>
          )}
        </section>

        {/* 未完了タスク */}
        <section className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            📝 未完了タスク
          </h2>
          
          {pendingTasks && pendingTasks.length > 0 ? (
             <div className="flex flex-col gap-3">
              {pendingTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                   <div className="w-3 h-3 rounded-full border-2 border-gray-400"></div>
                   <div className="flex-1">
                      <div className="font-medium">{task.title}</div>
                      <div className="text-xs text-gray-500">
                        {task.companies?.name ? `${task.companies.name} • ` : ''}
                        期限: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'なし'}
                      </div>
                   </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 py-4 text-center">タスクはありません ✨</p>
          )}
        </section>
      </div>
      
      {/* クイックリンク */}
      <section className="mt-10">
        <h2 className="text-xl font-bold mb-4">クイックアクセス</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/companies/new" className="p-4 bg-white border rounded-lg hover:shadow-md transition text-center flex flex-col items-center justify-center gap-2 h-32">
                <span className="text-2xl">🏢</span>
                <span className="font-bold">企業追加</span>
            </Link>
             <div className="p-4 bg-gray-100 border rounded-lg text-center flex flex-col items-center justify-center gap-2 h-32 opacity-50">
                <span className="text-2xl">📊</span>
                <span className="font-bold">分析(準備中)</span>
            </div>
        </div>
      </section>
    </div>
  );
}
