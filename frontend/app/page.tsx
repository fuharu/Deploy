import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { 
  AlertTriangle, 
  Building2, 
  Calendar, 
  CheckCircle2, 
  ClipboardList, 
  Clock, 
  FileText, 
  BarChart2, 
  Rocket, 
  Plus,
  Smile,
  Briefcase,
  Trophy,
  History
} from "lucide-react";

import WeeklyCalendar from "@/components/WeeklyCalendar";

// ステータスごとの設定
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  Interested: { label: "気になる", color: "#6366f1", bg: "bg-indigo-500" }, // Indigo
  Entry: { label: "エントリー", color: "#3b82f6", bg: "bg-blue-500" }, // Blue
  ES_Submit: { label: "ES提出済", color: "#0ea5e9", bg: "bg-sky-500" }, // Sky
  Interview: { label: "面接中", color: "#f59e0b", bg: "bg-amber-500" }, // Amber
  Offer: { label: "内定", color: "#22c55e", bg: "bg-green-500" }, // Green
  Rejected: { label: "不採用", color: "#ef4444", bg: "bg-red-500" }, // Red
};

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 直近のイベント取得
  const { data: upcomingEvents } = await supabase
    .from("events")
    .select("*, companies(name)")
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true })
    .limit(20);

  // 未完了タスク取得
  const { data: pendingTasks } = await supabase
    .from("tasks")
    .select("*, companies(name)")
    .eq("is_completed", false)
    .order("due_date", { ascending: true })
    .limit(5);

  // 企業ステータスの集計
  const { data: companies } = await supabase
    .from("companies")
    .select("status");
    
  const totalCompanies = companies?.length || 0;
  
  // ステータス集計
  const statusCounts: Record<string, number> = {
    Interested: 0,
    Entry: 0,
    ES_Submit: 0,
    Interview: 0,
    Offer: 0,
    Rejected: 0,
  };

  companies?.forEach((c) => {
    if (c.status in statusCounts) {
      statusCounts[c.status]++;
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

  // 円グラフ用のデータ計算
  let currentAngle = 0;
  const pieData = Object.entries(statusCounts)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => {
      const percentage = count / totalCompanies;
      const angle = percentage * 360;
      const startAngle = currentAngle;
      currentAngle += angle;
      return {
        status,
        count,
        percentage,
        startAngle,
        endAngle: currentAngle,
        color: STATUS_CONFIG[status]?.color || "#ccc"
      };
    });

  // SVG円グラフのパス生成ヘルパー
  const getPiePath = (startAngle: number, endAngle: number) => {
    const x1 = 50 + 50 * Math.cos(Math.PI * (startAngle - 90) / 180);
    const y1 = 50 + 50 * Math.sin(Math.PI * (startAngle - 90) / 180);
    const x2 = 50 + 50 * Math.cos(Math.PI * (endAngle - 90) / 180);
    const y2 = 50 + 50 * Math.sin(Math.PI * (endAngle - 90) / 180);
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    return `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-7xl space-y-8">
      
      {/* ヒーローエリア */}
      <section className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-10 shadow-lg border border-indigo-50 dark:border-gray-700 relative overflow-hidden">
        {/* 装飾背景 */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-50 dark:bg-orange-900/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-60"></div>

        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl md:text-4xl font-bold mb-4 text-gray-800 dark:text-white flex items-center justify-center md:justify-start gap-3">
              <span className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-full">
                <Smile className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </span>
              こんにちは、就活生さん！
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">
              {urgentEvents.length > 0 
                ? `明日にかけて${urgentEvents.length}件の予定があります。準備は万端ですか？` 
                : "直近の緊急タスクはありません。自分のペースで進めましょう。"}
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <div className="bg-white/80 dark:bg-gray-700/80 backdrop-blur px-4 py-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-500" />
                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">エントリー: {statusCounts.Entry}社</span>
              </div>
              <div className="bg-white/80 dark:bg-gray-700/80 backdrop-blur px-4 py-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">内定: {statusCounts.Offer}社</span>
              </div>
            </div>
          </div>

          {/* 進捗グラフ (ドーナツチャート) */}
          <div className="flex-shrink-0 w-64 h-64 relative flex items-center justify-center bg-white/50 dark:bg-gray-700/30 rounded-full backdrop-blur-sm shadow-inner border border-white/50 dark:border-gray-600">
             {totalCompanies > 0 ? (
                <svg viewBox="0 0 100 100" className="w-full h-full rotate-[-90deg]">
                  {pieData.map((d, i) => (
                    <path
                      key={d.status}
                      d={getPiePath(d.startAngle, d.endAngle)}
                      fill={d.color}
                      className="hover:opacity-90 transition-opacity cursor-pointer"
                    />
                  ))}
                  <circle cx="50" cy="50" r="35" fill="currentColor" className="text-white dark:text-gray-800" />
                </svg>
             ) : (
                <div className="text-gray-400 text-center text-xs">データなし</div>
             )}
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-gray-800 dark:text-white">{totalCompanies}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Total Companies</span>
             </div>
          </div>
        </div>
      </section>

      {/* リマインダーアラート (緊急時のみ) */}
      {urgentEvents.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm animate-pulse-slow">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-bold text-red-800 dark:text-red-300">直近の予定 ({urgentEvents.length}件)</h3>
              <ul className="mt-1 space-y-1">
                 {urgentEvents.map(e => (
                   <li key={e.id} className="text-sm text-red-700 dark:text-red-200">
                      {new Date(e.start_time).toLocaleDateString()} {new Date(e.start_time).getHours()}:{new Date(e.start_time).getMinutes().toString().padStart(2, '0')} - {e.title}
                   </li>
                 ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左カラム: カレンダー & タイムライン */}
        <div className="lg:col-span-2 space-y-8">
           <WeeklyCalendar events={upcomingEvents || []} />
           
           {/* クイックアクセス (温かみのあるカラー) */}
           <section>
              <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
                 <Rocket className="w-6 h-6 text-orange-500" /> クイックアクセス
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Link href="/companies/new" className="group p-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-1 transition flex flex-col items-center justify-center gap-2 h-28">
                      <div className="bg-white/20 p-2 rounded-full">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <span className="font-bold text-sm">企業追加</span>
                  </Link>
                  
                  <Link href="/companies" className="group p-4 bg-gradient-to-br from-emerald-400 to-teal-500 text-white rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-1 transition flex flex-col items-center justify-center gap-2 h-28">
                      <div className="bg-white/20 p-2 rounded-full">
                         <FileText className="w-6 h-6" />
                      </div>
                      <span className="font-bold text-sm">ES管理</span>
                  </Link>

                  <Link href="/companies" className="group p-4 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-1 transition flex flex-col items-center justify-center gap-2 h-28">
                      <div className="bg-white/20 p-2 rounded-full">
                         <Calendar className="w-6 h-6" />
                      </div>
                      <span className="font-bold text-sm">カレンダー</span>
                  </Link>

                  <Link href="/companies" className="group p-4 bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-1 transition flex flex-col items-center justify-center gap-2 h-28">
                      <div className="bg-white/20 p-2 rounded-full">
                         <BarChart2 className="w-6 h-6" />
                      </div>
                      <span className="font-bold text-sm">分析 (Coming Soon)</span>
                  </Link>
              </div>
           </section>
        </div>

        {/* 右カラム: タスク & 最近の活動 */}
        <div className="lg:col-span-1 space-y-8">
            {/* 未完了タスク */}
            <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <ClipboardList className="w-24 h-24 text-indigo-500" />
              </div>
              
              <div className="flex justify-between items-center mb-6 relative z-10">
                <h2 className="text-lg font-bold flex items-center gap-2 dark:text-white">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500" /> 今日のタスク
                </h2>
                <span className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 px-2 py-1 rounded-full font-bold">
                    残り {pendingTasks ? pendingTasks.length : 0}件
                </span>
              </div>
              
              <div className="relative z-10">
                {pendingTasks && pendingTasks.length > 0 ? (
                    <div className="space-y-3">
                    {pendingTasks.map((task) => (
                        <Link href={`/companies/${task.company_id || '#'}`} key={task.id} className="block group">
                            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-transparent hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition">
                                <div className="mt-1 w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-500 group-hover:border-indigo-500 transition bg-white dark:bg-gray-800"></div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-sm text-gray-800 dark:text-gray-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition truncate">{task.title}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                                        {task.companies?.name && (
                                            <span className="truncate flex items-center gap-1 bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded shadow-sm">
                                                <Building2 className="w-3 h-3" /> {task.companies.name}
                                            </span>
                                        )}
                                        {task.due_date && (
                                            <span className={`flex items-center gap-1 ${new Date(task.due_date) < new Date() ? 'text-red-500 font-bold' : ''}`}>
                                                <Clock className="w-3 h-3" /> {new Date(task.due_date).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                    <Link href="/companies" className="block text-center text-xs text-indigo-500 hover:text-indigo-600 font-medium mt-4">
                        すべてのタスクを確認する
                    </Link>
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <div className="inline-block p-4 bg-green-100 dark:bg-green-900/30 rounded-full mb-3 animate-bounce">
                            <Smile className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="font-bold text-gray-800 dark:text-white">素晴らしい！</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">全てのタスクが完了しています。</p>
                    </div>
                )}
              </div>
            </section>
            
            {/* 最近の活動 (簡易モック) */}
            <section>
                 <h2 className="text-lg font-bold mb-4 dark:text-white flex items-center gap-2">
                    <History className="w-5 h-5 text-gray-500" /> 最近の活動履歴
                </h2>
                <div className="relative pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-6">
                    <div className="relative">
                        <div className="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-indigo-500 border-2 border-white dark:border-gray-900"></div>
                        <p className="text-xs text-gray-500 mb-0.5">今日 10:30</p>
                        <p className="text-sm font-medium dark:text-gray-200">株式会社Aの面接日程を登録しました</p>
                    </div>
                    <div className="relative">
                        <div className="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-white dark:border-gray-900"></div>
                        <p className="text-xs text-gray-500 mb-0.5">昨日 15:00</p>
                        <p className="text-sm font-medium dark:text-gray-200">株式会社Bのエントリーシートを作成しました</p>
                    </div>
                     <div className="relative">
                        <div className="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-white dark:border-gray-900"></div>
                        <p className="text-xs text-gray-500 mb-0.5">2日前</p>
                        <p className="text-sm font-medium dark:text-gray-200">新規アカウントを作成しました</p>
                    </div>
                </div>
            </section>
        </div>
      </div>
    </div>
  );
}