"""
イベント関連のモデル
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class EventType(str, Enum):
    INTERVIEW = "interview"
    DEADLINE = "deadline"
    SEMINAR = "seminar"
    OTHER = "other"

class EventBase(BaseModel):
    company_id: Optional[int] = None
    title: str
    type: EventType
    start_time: datetime
    end_time: Optional[datetime] = None
    location: Optional[str] = None
    description: Optional[str] = None
    google_event_id: Optional[str] = None

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[EventType] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    location: Optional[str] = None
    description: Optional[str] = None

class Event(EventBase):
    id: int
    user_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True