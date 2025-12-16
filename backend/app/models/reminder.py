"""
リマインダー関連のモデル
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

class ReminderType(str, Enum):
    EMAIL_CHECK = "email_check"
    APPLICATION = "application"
    DEADLINE = "deadline"
    INTERVIEW_PREP = "interview_prep"

class ReminderBase(BaseModel):
    company_id: int
    type: ReminderType
    message: str
    due_date: Optional[datetime] = None

class Reminder(ReminderBase):
    id: int
    user_id: str
    is_read: bool = False
    created_at: datetime

    class Config:
        from_attributes = True

class ReminderResponse(BaseModel):
    reminders: List[Reminder]
    unread_count: int