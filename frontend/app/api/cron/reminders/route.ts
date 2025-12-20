import { createAdminClient } from '@/utils/supabase/admin';
import { sendEmail } from '@/utils/mail';
import { NextResponse } from 'next/server';

// キャッシュを無効化（常に最新データを取得）
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // ---------------------------------------------------------
    // 1. メール確認リマインド (全ユーザー対象)
    // ---------------------------------------------------------
    // 実際にはユーザーごとの設定を見るべきですが、MVPとして全員に送る例
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, name');

    if (usersError) throw usersError;

    if (users) {
      for (const user of users) {
        // メール送信
        await sendEmail(
          user.email,
          '【就活管理】毎日のメールチェックリマインド',
          `${user.name || '就活生'}さん、おはようございます。\n今日も企業からのメールボックスを確認しましょう！\n\nアプリを開く: ${appUrl}`
        );
      }
    }

    // ---------------------------------------------------------
    // 2. 応募リマインド (締切が明日のイベント)
    // ---------------------------------------------------------
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStart = tomorrow.toISOString().split('T')[0] + 'T00:00:00';
    const tomorrowEnd = tomorrow.toISOString().split('T')[0] + 'T23:59:59';

    const { data: deadlineEvents, error: eventsError } = await supabase
      .from('events')
      .select('*, companies(name), userevents!inner(user_id)')
      .eq('type', 'Deadline')
      .gte('start_time', tomorrowStart)
      .lte('start_time', tomorrowEnd);

    if (eventsError) throw eventsError;

    if (deadlineEvents) {
      for (const event of deadlineEvents) {
        // 参加ユーザーごとに通知
        const participants = event.userevents || [];
        for (const participant of (Array.isArray(participants) ? participants : [participants])) {
            // ユーザーのメールアドレスを取得
            const user = users?.find(u => u.id === (participant as any).user_id);
            if (user && user.email) {
                const companyName = event.companies?.name || '企業';
                
                // メール送信
                await sendEmail(
                    user.email,
                    `【応募リマインド】${companyName}の締切が明日です`,
                    `${companyName}の「${event.title}」の締切が明日に迫っています。\n提出の準備はできていますか？\n\n詳細: ${appUrl}/companies/${event.company_id}`
                );
                
                // アプリ内通知を作成
                await supabase.from('notifications').insert({
                    user_id: (participant as any).user_id,
                    title: '応募締切リマインド',
                    content: `${companyName}の締切が明日です: ${event.title}`,
                    link: `/companies/${event.company_id}`
                });
            }
        }
      }
    }

    // ---------------------------------------------------------
    // 3. 振り返りログリマインド (昨日のイベントで振り返りがないもの)
    // ---------------------------------------------------------
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStart = yesterday.toISOString().split('T')[0] + 'T00:00:00';
    const yesterdayEnd = yesterday.toISOString().split('T')[0] + 'T23:59:59';

    // 昨日のイベントを取得
    const { data: pastEvents } = await supabase
      .from('events')
      .select('id, title, company_id, companies(name), userevents!inner(user_id)')
      .gte('start_time', yesterdayStart)
      .lte('start_time', yesterdayEnd);

    if (pastEvents) {
        for (const event of pastEvents) {
            const participants = event.userevents || [];
            for (const participant of (Array.isArray(participants) ? participants : [participants])) {
                const userId = (participant as any).user_id;

                // 振り返りがあるかチェック
                const { data: reflection } = await supabase
                    .from('reflections')
                    .select('id')
                    .eq('event_id', event.id)
                    .single(); // user_idで絞り込むべきだがreflectionsにuser_idがない？スキーマ上はない。event_id UNIQUE制約あり。
                    // スキーマ: reflections (id, event_id UNIQUE, ...) -> 1イベント1振り返り。
                    // ということは、イベント自体がユーザー固有（1:1）であるべき。
                    // しかし userevents で N:N になっている。
                    // ここは矛盾しているが、とりあえず「振り返りがなければ送る」ロジックにする。
                    // もし複数人が参加するイベントなら、誰か一人が書いたら終わり？
                    // 本来は reflections に user_id が必要、または reflections.event_id が userevents を参照すべき。
                    // とりあえず現状のスキーマに従う。
                
                // 振り返りがない場合、リマインド
                if (!reflection) {
                    const user = users?.find(u => u.id === userId);
                    if (user && user.email) {
                        const companyName = event.companies?.name || '企業';
                        
                        await sendEmail(
                            user.email,
                            `【振り返り】昨日の${companyName}のイベントはいかがでしたか？`,
                            `昨日の「${event.title}」の振り返りを記録しましょう。\n記憶が鮮明なうちに記録することで、次の選考に活かせます。\n\n記録する: ${appUrl}/companies/${event.company_id}`
                        );

                        await supabase.from('notifications').insert({
                            user_id: userId,
                            title: '振り返りリマインド',
                            content: `昨日のイベントの振り返りを書きましょう: ${event.title}`,
                            link: `/companies/${event.company_id}`
                        });
                    }
                }
            }
        }
    }

    return NextResponse.json({ success: true, message: "Reminders sent" });
  } catch (error: any) {
    console.error('Reminder error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

