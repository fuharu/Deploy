"""
イベント/カレンダー管理 API ルート
担当: はやと
"""
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import datetime
from uuid import UUID
from ..models.models import Event, EventCreate
from ..database import supabase

router = APIRouter(prefix="/api/events", tags=["events"])

@router.get("/", response_model=List[Event])
async def get_events(
    user_id: str = "test-user",
    company_id: Optional[UUID] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """
    オプションのフィルタ付きでイベントを取得
    """
    if not supabase:
        return []

    try:
        query = supabase.table("events").select("*, companies(name)").eq("user_id", user_id)

        if company_id:
            query = query.eq("company_id", company_id)
        if start_date:
            query = query.gte("start_time", start_date)
        if end_date:
            query = query.lte("start_time", end_date)

        response = query.order("start_time").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=Event)
async def create_event(event: EventCreate, user_id: str = "test-user"):
    """
    新しいイベントを作成
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not connected")

    try:
        data = event.dict()
        data["user_id"] = user_id
        response = supabase.table("events").insert(data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{event_id}", response_model=Event)
async def get_event(event_id: UUID, user_id: str = "test-user"):
    """
    特定のイベントを取得
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not connected")

    try:
        response = supabase.table("events").select("*, companies(name)").eq("id", event_id).eq("user_id", user_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Event not found")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{event_id}", response_model=Event)
async def update_event(event_id: UUID, event: EventCreate, user_id: str = "test-user"):
    """
    イベントを更新
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not connected")

    try:
        data = event.dict(exclude_unset=True)
        response = supabase.table("events").update(data).eq("id", event_id).eq("user_id", user_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Event not found")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{event_id}")
async def delete_event(event_id: UUID, user_id: str = "test-user"):
    """
    イベントを削除
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not connected")

    try:
        response = supabase.table("events").delete().eq("id", event_id).eq("user_id", user_id).execute()
        return {"message": "Event deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))