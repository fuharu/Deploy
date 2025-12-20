"""
企業管理 API ルート
担当: はやと
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from uuid import UUID
from ..models.models import Company, CompanyCreate
from ..database import supabase

router = APIRouter(prefix="/api/companies", tags=["companies"])

@router.get("/", response_model=List[Company])
async def get_companies(user_id: str = "test-user"):
    """
    ユーザーの全企業を取得
    """
    if not supabase:
        return []

    try:
        response = supabase.table("companies").select("*").eq("user_id", user_id).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=Company)
async def create_company(company: CompanyCreate, user_id: str = "test-user"):
    """
    新しい企業を作成
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not connected")

    try:
        data = company.dict()
        data["user_id"] = user_id
        response = supabase.table("companies").insert(data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{company_id}", response_model=Company)
async def get_company(company_id: UUID, user_id: str = "test-user"):
    """
    特定の企業を取得
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not connected")

    try:
        response = supabase.table("companies").select("*").eq("id", company_id).eq("user_id", user_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Company not found")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{company_id}", response_model=Company)
async def update_company(company_id: UUID, company: CompanyCreate, user_id: str = "test-user"):
    """
    企業情報を更新
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not connected")

    try:
        data = company.dict(exclude_unset=True)
        response = supabase.table("companies").update(data).eq("id", company_id).eq("user_id", user_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Company not found")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{company_id}")
async def delete_company(company_id: UUID, user_id: str = "test-user"):
    """
    企業を削除
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not connected")

    try:
        response = supabase.table("companies").delete().eq("id", company_id).eq("user_id", user_id).execute()
        return {"message": "Company deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))