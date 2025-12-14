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
  History,
  PenTool,
  Sun,
  Moon,
  Sunrise
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
        color: STATUS_CONFIG[status]?.color || "#94a3b8"
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
    <div className="container mx-auto p-4 md:p-8 max-w-7xl space-y-6">
      
      {/* ヒーローエリア */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-md shadow-indigo-100 dark:shadow-none border border-indigo-50 dark:border-white/10 relative overflow-hidden group">
        
        {/* 動くBlob背景 (Organic Atmosphere) */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-indigo-200 dark:bg-indigo-900/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-20 -mt-20 w-72 h-72 bg-purple-200 dark:bg-purple-900/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-20 w-72 h-72 bg-pink-200 dark:bg-pink-900/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

        {/* コンテンツレイヤー */}
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-xl md:text-3xl font-bold mb-3 text-indigo-950 dark:text-white flex items-center justify-center md:justify-start gap-3">
              <span className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-full border border-indigo-200 dark:border-indigo-700/50">
                <GreetingIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </span>
              {greeting}、就活生さん！
            </h1>
            <p className="text-gray-600 dark:text-slate-300 text-base mb-4 leading-relaxed max-w-xl">
              {urgentEvents.length > 0 
                ? `明日にかけて${urgentEvents.length}件の予定があります。準備は万端ですか？` 
                : "直近の緊急タスクはありません。自分のペースで進めましょう。"}
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-gray-200 dark:border-white/10 flex items-center gap-3">
                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-1.5 rounded-lg">
                    <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                    <span className="text-xs text-gray-500 dark:text-slate-400 block font-bold">エントリー</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white font-sans">{statusCounts.Entry}</span>
                    <span className="text-xs text-gray-500 ml-1">社</span>
                </div>
              </div>
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-gray-200 dark:border-white/10 flex items-center gap-3">
                <div className="bg-amber-100 dark:bg-amber-900/50 p-1.5 rounded-lg">
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

          {/* 進捗グラフ (ドーナツチャート) - 太く、コンパクトに */}
          <div className="flex-shrink-0 w-48 h-48 relative flex items-center justify-center bg-white/60 dark:bg-slate-800/40 rounded-full backdrop-blur-sm shadow-inner border border-white/50 dark:border-white/10">
             <svg viewBox="0 0 100 100" className="w-full h-full rotate-[-90deg]">
               {/* ベースリング */}
               <circle cx="50" cy="50" r="50" className="text-gray-100 dark:text-slate-800" fill="currentColor" />
               
               {totalCompanies > 0 ? (
                  pieData.map((d, i) => (
                    <path
                      key={d.status}
                      d={getPiePath(d.startAngle, d.endAngle)}
                      fill={d.color}
                      className="hover:opacity-90 transition-opacity cursor-pointer"
                    />
                  ))
               ) : (
                  <path d={getPiePath(0, 360)} fill="#e2e8f0" className="text-gray-200 dark:text-slate-700" />
               )}
               {/* 中央の穴 */}
               <circle cx="50" cy="50" r="25" fill="currentColor" className="text-white dark:text-slate-900" />
             </svg>
             
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-5xl font-bold text-gray-800 dark:text-white font-sans tracking-tight">{totalCompanies}</span>
                <span className="text-[10px] text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">Total</span>
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
        {/* 左カラム: カレンダー & タイムライン */}
        <div className="lg:col-span-2 space-y-8">
           <WeeklyCalendar events={upcomingEvents || []} />
           
           {/* クイックアクセス (白ベース、メインカラー統一) */}
           <section>
              <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2 text-indigo-950">
                 <Rocket className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> クイックアクセス
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Link href="/companies/new" className="group p-4 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-200 rounded-2xl shadow-md shadow-indigo-100/50 dark:shadow-none hover:shadow-lg dark:hover:shadow-none border border-indigo-200 dark:border-white/20 hover:border-indigo-400 dark:hover:border-indigo-500/50 dark:hover:bg-slate-800/50 transition-all hover:-translate-y-1 flex flex-col items-center justify-center gap-3 h-32 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                      <div className="bg-indigo-100 dark:bg-indigo-900/40 p-3 rounded-2xl group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/60 transition-colors">
                        <Building2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <span className="font-bold text-sm text-gray-700 dark:text-slate-200 group-hover:text-indigo-700 dark:group-hover:text-white transition-colors">企業追加</span>
                  </Link>
                  
                  <Link href="/companies" className="group p-4 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-200 rounded-2xl shadow-md shadow-blue-100/50 dark:shadow-none hover:shadow-lg dark:hover:shadow-none border border-blue-200 dark:border-white/20 hover:border-blue-400 dark:hover:border-blue-500/50 dark:hover:bg-slate-800/50 transition-all hover:-translate-y-1 flex flex-col items-center justify-center gap-3 h-32 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                      <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-2xl group-hover:bg-blue-200 dark:group-hover:bg-blue-900/60 transition-colors">
                         <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="font-bold text-sm text-gray-700 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-white transition-colors">ES管理</span>
                  </Link>

                  <Link href="/companies" className="group p-4 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-200 rounded-2xl shadow-md shadow-amber-100/50 dark:shadow-none hover:shadow-lg dark:hover:shadow-none border border-amber-200 dark:border-white/20 hover:border-amber-400 dark:hover:border-amber-500/50 dark:hover:bg-slate-800/50 transition-all hover:-translate-y-1 flex flex-col items-center justify-center gap-3 h-32 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                      <div className="bg-amber-100 dark:bg-amber-900/40 p-3 rounded-2xl group-hover:bg-amber-200 dark:group-hover:bg-amber-900/60 transition-colors">
                         <Calendar className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                      </div>
                      <span className="font-bold text-sm text-gray-700 dark:text-slate-200 group-hover:text-amber-700 dark:group-hover:text-white transition-colors">カレンダー</span>
                  </Link>

                  <Link href="/companies" className="group p-4 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-200 rounded-2xl shadow-md shadow-rose-100/50 dark:shadow-none hover:shadow-lg dark:hover:shadow-none border border-rose-200 dark:border-white/20 hover:border-rose-400 dark:hover:border-rose-500/50 dark:hover:bg-slate-800/50 transition-all hover:-translate-y-1 flex flex-col items-center justify-center gap-3 h-32 relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-full h-1 bg-rose-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                      <div className="bg-rose-100 dark:bg-rose-900/40 p-3 rounded-2xl group-hover:bg-rose-200 dark:group-hover:bg-rose-900/60 transition-colors">
                         <BarChart2 className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                      </div>
                      <span className="font-bold text-sm text-gray-700 dark:text-slate-200 group-hover:text-rose-700 dark:group-hover:text-white transition-colors">分析</span>
                  </Link>
              </div>
           </section>
        </div>

        {/* 右カラム: タスク & 最近の活動 */}
        <div className="lg:col-span-1 space-y-8">
            {/* 未完了タスク */}
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
            
            {/* 最近の活動 */}
            <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-white/10 shadow-md shadow-gray-100 dark:shadow-none hover:shadow-lg dark:hover:shadow-none transition-all">
                 <h2 className="text-lg font-bold mb-4 dark:text-white flex items-center gap-2 text-indigo-950">
                    <History className="w-5 h-5 text-gray-400" /> 最近の活動履歴
                </h2>
                <div className="relative pl-4 border-l-2 border-gray-100 dark:border-white/10 space-y-8 py-2">
                    <div className="relative group">
                        <div className="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-slate-900 group-hover:scale-125 transition-transform shadow-sm"></div>
                        <p className="text-xs text-gray-400 font-mono mb-0.5">Today 10:30</p>
                        <p className="text-sm font-medium dark:text-gray-200 text-gray-800 group-hover:text-indigo-600 transition-colors">株式会社Aの面接日程を登録しました</p>
                    </div>
                    <div className="relative group">
                        <div className="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-gray-300 dark:bg-slate-600 ring-4 ring-white dark:ring-slate-900 group-hover:scale-125 transition-transform shadow-sm"></div>
                        <p className="text-xs text-gray-400 font-mono mb-0.5">Yesterday 15:00</p>
                        <p className="text-sm font-medium dark:text-gray-200 text-gray-800 group-hover:text-indigo-600 transition-colors">株式会社Bのエントリーシートを作成しました</p>
                    </div>
                     <div className="relative group">
                        <div className="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-gray-300 dark:bg-slate-600 ring-4 ring-white dark:ring-slate-900 group-hover:scale-125 transition-transform shadow-sm"></div>
                        <p className="text-xs text-gray-400 font-mono mb-0.5">2 days ago</p>
                        <p className="text-sm font-medium dark:text-gray-200 text-gray-800 group-hover:text-indigo-600 transition-colors">新規アカウントを作成しました</p>
                    </div>
                </div>
            </section>
        </div>
      </div>
    </div>
  );
}