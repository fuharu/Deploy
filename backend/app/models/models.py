from pydantic import BaseModel, Field, EmailStr, HttpUrl
from typing import Optional, List
from datetime import datetime
from uuid import UUID
import enum

# Enum definitions
class CompanyStatus(str, enum.Enum):
    Interested = 'Interested'
    Entry = 'Entry'
    ES_Submit = 'ES_Submit'
    Interview = 'Interview'
    Offer = 'Offer'
    Rejected = 'Rejected'

class EventType(str, enum.Enum):
    Interview = 'Interview'
    Deadline = 'Deadline'
    Seminar = 'Seminar'
    Other = 'Other'

class ESStatus(str, enum.Enum):
    Draft = 'Draft'
    Completed = 'Completed'

class UserEventStatus(str, enum.Enum):
    Entry = 'Entry'
    Joined = 'Joined'
    Canceled = 'Canceled'

# --- Pydantic Models ---

# 4.1 Users / Profiles
class UserBase(BaseModel):
    email: EmailStr
    name: str
    university: str

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

# 4.2 Companies
class CompanyBase(BaseModel):
    name: str
    url: Optional[str] = None
    address: Optional[str] = None
    industry: Optional[str] = None

class CompanyCreate(CompanyBase):
    pass

class Company(CompanyBase):
    id: UUID
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# New Table: UserCompanySelections
class UserCompanySelectionBase(BaseModel):
    status: CompanyStatus
    motivation_level: Optional[int] = None
    mypage_url: Optional[str] = None
    login_id: Optional[str] = None
    login_mailaddress: Optional[str] = None
    encrypted_password: Optional[str] = None

class UserCompanySelectionCreate(UserCompanySelectionBase):
    company_id: UUID
    user_id: UUID

class UserCompanySelection(UserCompanySelectionBase):
    id: UUID
    company_id: UUID
    user_id: UUID
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# 4.3 Events
class EventBase(BaseModel):
    title: str
    type: EventType
    start_time: datetime
    end_time: Optional[datetime] = None
    location: Optional[str] = None
    description: Optional[str] = None

class EventCreate(EventBase):
    company_id: Optional[UUID] = None

class Event(EventBase):
    id: UUID
    company_id: Optional[UUID] = None

    class Config:
        from_attributes = True

# New Table: UserEvents
class UserEventBase(BaseModel):
    status: str # Using str as per original note, or use UserEventStatus if strictly enforced

class UserEventCreate(UserEventBase):
    event_id: UUID
    user_id: UUID

class UserEvent(UserEventBase):
    event_id: UUID
    user_id: UUID

    class Config:
        from_attributes = True

# 4.5 Reflections
class ReflectionBase(BaseModel):
    content: Optional[str] = None
    good_points: Optional[str] = None
    bad_points: Optional[str] = None
    self_score: Optional[int] = None

class ReflectionCreate(ReflectionBase):
    event_id: UUID

class Reflection(ReflectionBase):
    id: UUID
    event_id: UUID
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# 4.4 ES_Entries
class ESEntryBase(BaseModel):
    content: Optional[str] = None
    file_url: Optional[str] = None
    status: ESStatus = ESStatus.Draft
    submitted_at: Optional[datetime] = None

class ESEntryCreate(ESEntryBase):
    company_id: UUID
    user_id: UUID

class ESEntry(ESEntryBase):
    id: UUID
    company_id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# 4.6 Tasks
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    is_completed: bool = False

class TaskCreate(TaskBase):
    user_id: UUID
    company_id: Optional[UUID] = None

class Task(TaskBase):
    id: UUID
    user_id: UUID
    company_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
