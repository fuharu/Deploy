"""
ES（エントリーシート）管理 API ルート
担当: はやと
"""
from fastapi import APIRouter, HTTPException
from typing import List
from uuid import UUID
from ..models.models import ESEntry, ESEntryCreate
from ..database import supabase

router = APIRouter(prefix="/api/es-entries", tags=["es_entries"])

@router.get("/company/{company_id}", response_model=List[ESEntry])
async def get_es_entries_by_company(company_id: UUID, user_id: str = "test-user"):
    """
    企業の全ESエントリーを取得
    """
    if not supabase:
        return []

    try:
        response = supabase.table("es_entries").select("*").eq("company_id", company_id).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=ESEntry)
async def create_es_entry(es_entry: ESEntryCreate, user_id: str = "test-user"):
    """
    新しいESエントリーを作成
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not connected")

    try:
        # 企業がユーザーに属していることを確認
        company = supabase.table("companies").select("id").eq("id", es_entry.company_id).eq("user_id", user_id).execute()
        if not company.data:
            raise HTTPException(status_code=403, detail="Company not found or access denied")

        data = es_entry.dict()
        response = supabase.table("es_entries").insert(data).execute()
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{entry_id}", response_model=ESEntry)
async def update_es_entry(entry_id: UUID, es_entry: ESEntryCreate, user_id: str = "test-user"):
    """
    ESエントリーを更新
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not connected")

    try:
        # 企業を通じて所有権を確認
        existing = supabase.table("es_entries").select("*, companies!inner(user_id)").eq("id", entry_id).execute()
        if not existing.data or existing.data[0]["companies"]["user_id"] != user_id:
            raise HTTPException(status_code=404, detail="ES entry not found or access denied")

        data = es_entry.dict(exclude_unset=True)
        response = supabase.table("es_entries").update(data).eq("id", entry_id).execute()
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{entry_id}")
async def delete_es_entry(entry_id: UUID, user_id: str = "test-user"):
    """
    ESエントリーを削除
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not connected")

    try:
        # 企業を通じて所有権を確認
        existing = supabase.table("es_entries").select("*, companies!inner(user_id)").eq("id", entry_id).execute()
        if not existing.data or existing.data[0]["companies"]["user_id"] != user_id:
            raise HTTPException(status_code=404, detail="ES entry not found or access denied")

        response = supabase.table("es_entries").delete().eq("id", entry_id).execute()
        return {"message": "ES entry deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))