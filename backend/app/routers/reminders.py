"""
リマインダー API ルート
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any
from uuid import UUID
from ..services.reminder_service import ReminderService
from ..database import supabase

router = APIRouter(prefix="/api/reminders", tags=["reminders"])

@router.get("")
async def get_all_reminders(
    user_id: UUID = Query(..., description="ユーザーID")
) -> Dict[str, Any]:
    """
    ユーザーの全リマインドを取得（優先度順）

    Returns:
        {
            "reminders": [
                {
                    "id": "uuid",
                    "type": "email_check" | "deadline_not_applied" | "deadline_applied",
                    "company_id": "uuid",
                    "company_name": "企業名",
                    "message": "リマインドメッセージ",
                    "priority": "high" | "medium" | "low",
                    "days_remaining": 2,  // 締切系のみ
                    "created_at": "ISO8601形式の日時"
                }
            ],
            "total_count": 5
        }
    """
    service = ReminderService(supabase)
    return await service.get_all_reminders(user_id)

@router.get("/email-check")
async def get_email_check_reminders(
    user_id: UUID = Query(..., description="ユーザーID")
) -> Dict[str, Any]:
    """
    メール確認リマインドのみ取得

    ES提出済み/面接中で7日以上更新がない企業が対象
    """
    service = ReminderService(supabase)
    return await service.get_email_check_reminders(user_id)

@router.get("/deadlines")
async def get_deadline_reminders(
    user_id: UUID = Query(..., description="ユーザーID")
) -> Dict[str, Any]:
    """
    締切リマインドのみ取得（優先度順）

    1-3日後の締切イベントが対象
    未応募の場合は「応募しましたか？」メッセージ付き
    """
    service = ReminderService(supabase)
    return await service.get_deadline_reminders(user_id)