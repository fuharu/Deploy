"""
リマインダー API ルート
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime, timedelta
from ..models.reminder import Reminder, ReminderResponse, ReminderType
from ..services.reminder_service import ReminderService
from ..database import supabase

router = APIRouter(prefix="/api/reminders", tags=["reminders"])

@router.get("/email-check/{company_id}")
async def get_email_check_reminder(company_id: int, user_id: str = "test-user"):
    """
    特定の企業のメールを確認すべきかチェック
    7日間アクティビティがない場合にリマインダーを返す
    """
    service = ReminderService(supabase)
    reminder = await service.check_email_reminder(company_id, user_id)
    if reminder:
        return {"should_check": True, "message": reminder.message}
    return {"should_check": False, "message": "No reminder needed"}

@router.get("/application")
async def get_application_reminders(user_id: str = "test-user"):
    """
    締切が近づいている企業のリマインダーを取得
    """
    service = ReminderService(supabase)
    reminders = await service.get_application_reminders(user_id)
    return ReminderResponse(
        reminders=reminders,
        unread_count=len([r for r in reminders if not r.is_read])
    )

@router.get("/all")
async def get_all_reminders(user_id: str = "test-user"):
    """
    ユーザーの全アクティブなリマインダーを取得
    """
    service = ReminderService(supabase)
    reminders = await service.get_all_reminders(user_id)
    return ReminderResponse(
        reminders=reminders,
        unread_count=len([r for r in reminders if not r.is_read])
    )

@router.put("/{reminder_id}/read")
async def mark_reminder_read(reminder_id: int, user_id: str = "test-user"):
    """
    リマインダーを既読にする
    """
    service = ReminderService(supabase)
    success = await service.mark_as_read(reminder_id, user_id)
    if success:
        return {"message": "Reminder marked as read"}
    raise HTTPException(status_code=404, detail="Reminder not found")