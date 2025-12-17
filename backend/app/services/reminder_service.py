"""
リマインダーのビジネスロジック
"""
from typing import List, Dict, Any
from datetime import datetime, timedelta, timezone
from uuid import UUID, uuid4
from enum import Enum

class ReminderType(str, Enum):
    """リマインドタイプ"""
    EMAIL_CHECK = "email_check"
    DEADLINE_NOT_APPLIED = "deadline_not_applied"
    DEADLINE_APPLIED = "deadline_applied"

class ReminderPriority(str, Enum):
    """リマインド優先度"""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class ReminderService:
    def __init__(self, supabase_client):
        self.supabase = supabase_client

    async def _generate_email_check_reminders(self, user_id: UUID) -> List[Dict[str, Any]]:
        """
        メール確認リマインドを生成
        ES提出済み/面接中で7日以上更新がない企業が対象
        """
        if not self.supabase:
            return []

        reminders = []
        try:
            # 7日前の日時を計算
            seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)

            # UserCompanySelectionsから結果待ち状態の企業を取得
            response = self.supabase.table("usercompanyselections").select(
                "*, companies(*)"
            ).eq(
                "user_id", str(user_id)
            ).in_(
                "status", ["ES_Submit", "Interview"]
            ).lt(
                "updated_at", seven_days_ago.isoformat()
            ).execute()

            if response.data:
                for selection in response.data:
                    if not selection.get("companies"):
                        continue

                    company = selection["companies"]
                    company_id = selection["company_id"]

                    # 今後7日以内にイベントがある企業は除外
                    seven_days_later = datetime.now(timezone.utc) + timedelta(days=7)
                    events_response = self.supabase.table("events").select(
                        "id"
                    ).eq(
                        "company_id", company_id
                    ).gte(
                        "start_time", datetime.now(timezone.utc).isoformat()
                    ).lt(
                        "start_time", seven_days_later.isoformat()
                    ).limit(1).execute()

                    if events_response.data:
                        continue  # 近日中にイベントがある場合はリマインド不要

                    # 最終更新からの経過日数を計算
                    updated_at = datetime.fromisoformat(
                        selection["updated_at"].replace("Z", "+00:00")
                    )
                    days_passed = (datetime.now(timezone.utc) - updated_at).days

                    reminders.append({
                        "id": str(uuid4()),
                        "type": ReminderType.EMAIL_CHECK,
                        "company_id": company_id,
                        "company_name": company["name"],
                        "message": f"{company['name']}からメールが届いていませんか？最終更新から{days_passed}日経過しています",
                        "priority": ReminderPriority.LOW,
                        "days_passed": days_passed,
                        "created_at": datetime.now(timezone.utc).isoformat()
                    })

        except Exception as e:
            print(f"Error generating email check reminders: {e}")

        return reminders

    async def _generate_deadline_reminders(self, user_id: UUID) -> List[Dict[str, Any]]:
        """
        締切リマインドを生成
        1-3日後の締切イベントが対象
        """
        if not self.supabase:
            return []

        reminders = []
        try:
            now = datetime.now(timezone.utc)
            one_day_later = now + timedelta(days=1)
            three_days_later = now + timedelta(days=3)

            # 1-3日後の締切イベントを取得
            events_response = self.supabase.table("events").select(
                "*, companies(*)"
            ).eq(
                "type", "Deadline"
            ).gte(
                "start_time", one_day_later.isoformat()
            ).lte(
                "start_time", three_days_later.isoformat()
            ).execute()

            if events_response.data:
                for event in events_response.data:
                    if not event.get("companies"):
                        continue

                    company = event["companies"]
                    company_id = event["company_id"]

                    # その企業の選考ステータスを取得
                    selection_response = self.supabase.table("usercompanyselections").select(
                        "status"
                    ).eq(
                        "user_id", str(user_id)
                    ).eq(
                        "company_id", company_id
                    ).single().execute()

                    # 締切までの残り日数を計算
                    deadline = datetime.fromisoformat(
                        event["start_time"].replace("Z", "+00:00")
                    )
                    time_remaining = deadline - now
                    days_remaining = time_remaining.days
                    hours_remaining = time_remaining.seconds // 3600

                    # 残り日数に応じた表現
                    if days_remaining == 0:
                        time_str = f"{hours_remaining}時間"
                    elif days_remaining == 1 and hours_remaining > 0:
                        time_str = f"1日と{hours_remaining}時間"
                    else:
                        time_str = f"{days_remaining}日"

                    # ステータスに応じてメッセージと優先度を設定
                    if selection_response.data and selection_response.data.get("status") == "Interested":
                        # 未応募の場合
                        message = f"{company['name']}の締切まであと{time_str}です。応募しましたか？"
                        reminder_type = ReminderType.DEADLINE_NOT_APPLIED
                        priority = ReminderPriority.HIGH if days_remaining <= 1 else ReminderPriority.MEDIUM
                    else:
                        # 応募済みの場合
                        message = f"{company['name']}の締切まであと{time_str}です"
                        reminder_type = ReminderType.DEADLINE_APPLIED
                        priority = ReminderPriority.MEDIUM

                    reminders.append({
                        "id": str(uuid4()),
                        "type": reminder_type,
                        "company_id": company_id,
                        "company_name": company["name"],
                        "message": message,
                        "priority": priority,
                        "days_remaining": days_remaining,
                        "deadline": deadline.isoformat(),
                        "created_at": datetime.now(timezone.utc).isoformat()
                    })

        except Exception as e:
            print(f"Error generating deadline reminders: {e}")

        return reminders

    async def get_all_reminders(self, user_id: UUID) -> Dict[str, Any]:
        """
        ユーザーの全リマインドを取得
        優先度順にソートして返す
        """
        reminders = []

        # メール確認リマインドを生成
        email_reminders = await self._generate_email_check_reminders(user_id)
        reminders.extend(email_reminders)

        # 締切リマインドを生成
        deadline_reminders = await self._generate_deadline_reminders(user_id)
        reminders.extend(deadline_reminders)

        # 優先度でソート（HIGH > MEDIUM > LOW）
        priority_order = {
            ReminderPriority.HIGH: 0,
            ReminderPriority.MEDIUM: 1,
            ReminderPriority.LOW: 2
        }
        reminders.sort(key=lambda x: (priority_order[x["priority"]], x.get("days_remaining", 999)))

        # 最大50件まで
        reminders = reminders[:50]

        return {
            "reminders": reminders,
            "total_count": len(reminders)
        }

    async def get_email_check_reminders(self, user_id: UUID) -> Dict[str, Any]:
        """
        メール確認リマインドのみ取得
        """
        reminders = await self._generate_email_check_reminders(user_id)

        return {
            "reminders": reminders,
            "total_count": len(reminders)
        }

    async def get_deadline_reminders(self, user_id: UUID) -> Dict[str, Any]:
        """
        締切リマインドのみ取得
        """
        reminders = await self._generate_deadline_reminders(user_id)

        # 優先度でソート
        priority_order = {
            ReminderPriority.HIGH: 0,
            ReminderPriority.MEDIUM: 1,
            ReminderPriority.LOW: 2
        }
        reminders.sort(key=lambda x: (priority_order[x["priority"]], x.get("days_remaining", 999)))

        return {
            "reminders": reminders,
            "total_count": len(reminders)
        }