"""
ES（エントリーシート）関連のモデル
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class ESStatus(str, Enum):
    DRAFT = "draft"
    COMPLETED = "completed"
    SUBMITTED = "submitted"

class ESEntryBase(BaseModel):
    company_id: int
    question: str
    answer: Optional[str] = None
    max_chars: Optional[int] = None
    status: ESStatus = ESStatus.DRAFT

class ESEntryCreate(ESEntryBase):
    pass

class ESEntryUpdate(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    max_chars: Optional[int] = None
    status: Optional[ESStatus] = None

class ESEntry(ESEntryBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True