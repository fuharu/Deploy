"""
企業関連のモデル
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class CompanyStatus(str, Enum):
    INTERESTED = "interested"
    ENTRY = "entry"
    ES_SUBMIT = "es_submit"
    INTERVIEW = "interview"
    OFFER = "offer"
    REJECTED = "rejected"

class CompanyBase(BaseModel):
    name: str
    url: Optional[str] = None
    login_id: Optional[str] = None
    password: Optional[str] = None
    status: CompanyStatus = CompanyStatus.INTERESTED
    motivation_level: int = 3  # 1-5

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None
    login_id: Optional[str] = None
    password: Optional[str] = None
    status: Optional[CompanyStatus] = None
    motivation_level: Optional[int] = None

class Company(CompanyBase):
    id: int
    user_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True