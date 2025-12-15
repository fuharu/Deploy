"""
リマインダーのビジネスロジック
"""
from typing import List, Optional
from datetime import datetime, timedelta
from ..models.reminder import Reminder, ReminderType

class ReminderService:
    def __init__(self, supabase_client):
        self.supabase = supabase_client

    async def check_email_reminder(self, company_id: int, user_id: str) -> Optional[Reminder]:
        """
        企業のメール確認リマインダーが必要かチェック
        7日以上連絡がない場合にリマインダーを返す
        """
        if not self.supabase:
            return None

        try:
            # 企業の最新イベントを取得
            response = self.supabase.table("events").select("*").eq("company_id", company_id).order("created_at", desc=True).limit(1).execute()

            if response.data and len(response.data) > 0:
                last_event = response.data[0]
                last_event_date = datetime.fromisoformat(last_event["created_at"].replace("Z", "+00:00"))

                # 7日以上経過しているかチェック
                if datetime.now() - last_event_date > timedelta(days=7):
                    return Reminder(
                        id=0,
                        company_id=company_id,
                        user_id=user_id,
                        type=ReminderType.EMAIL_CHECK,
                        message=f"7日以上連絡がありません。メールを確認してください。",
                        is_read=False,
                        created_at=datetime.now()
                    )
        except Exception as e:
            print(f"Error checking email reminder: {e}")

        return None

    async def get_application_reminders(self, user_id: str) -> List[Reminder]:
        """
        締切が近づいている応募のリマインダーを取得
        """
        if not self.supabase:
            return []

        reminders = []
        try:
            # 締切が近い企業を取得（3日以内）
            three_days_later = (datetime.now() + timedelta(days=3)).isoformat()

            response = self.supabase.table("events").select("*, companies(*)").eq("type", "deadline").lte("start_time", three_days_later).gte("start_time", datetime.now().isoformat()).execute()

            for event in response.data:
                if event.get("companies"):
                    company = event["companies"]
                    reminders.append(Reminder(
                        id=event["id"],
                        company_id=company["id"],
                        user_id=user_id,
                        type=ReminderType.DEADLINE,
                        message=f"{company['name']}の締切が近づいています",
                        due_date=datetime.fromisoformat(event["start_time"].replace("Z", "+00:00")),
                        is_read=False,
                        created_at=datetime.now()
                    ))
        except Exception as e:
            print(f"Error getting application reminders: {e}")

        return reminders

    async def get_all_reminders(self, user_id: str) -> List[Reminder]:
        """
        ユーザーの全アクティブなリマインダーを取得
        """
        reminders = []

        # 異なる種類のリマインダーを統合
        # これは簡易版 - 本番環境ではリマインダーをDBに保存すべき

        if not self.supabase:
            return []

        try:
            # ユーザーの企業一覧を取得
            response = self.supabase.table("companies").select("*").eq("user_id", user_id).execute()

            for company in response.data:
                # 各企業のメールリマインダーをチェック
                email_reminder = await self.check_email_reminder(company["id"], user_id)
                if email_reminder:
                    reminders.append(email_reminder)
        except Exception as e:
            print(f"Error getting all reminders: {e}")

        # 応募締切リマインダーを追加
        app_reminders = await self.get_application_reminders(user_id)
        reminders.extend(app_reminders)

        return reminders

    async def mark_as_read(self, reminder_id: int, user_id: str) -> bool:
        """
        リマインダーを既読にする
        """
        # 実際の実装では、ここでデータベースを更新する
        # 現在は仮でTrueを返す
        return True