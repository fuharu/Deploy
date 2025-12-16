"""
企業管理 API ルート
担当: はやと
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from supabase import Client
from typing import List, Dict, Any, Optional
from ..database import get_supabase_client

router = APIRouter(prefix="/companies")

@router.get("/read", response_model = List[Dict[str, Any]], summary="すべての会社を取得")
def read_all_companies(
    # get_supabase 関数を依存性として注入
    db: Client = Depends(get_supabase_client)
  ):
  try:
    response = db.from_('companies').select('*').execute()
    return response.data

  except Exception as e:
    print(f"Supabase error: {e}")
    raise HTTPException(status_code=500, detail=f"Database query failed: {e}")

@router.get("/read/search", response_model=List[Dict[str, Any]], summary="キーワードと業界名で企業を検索")
def read_search_companies(
    keyword: Optional[str] = Query(None, description="企業名またはURLの部分一致検索キーワード"),
    industry: Optional[str] = Query(None, description="業界名での完全一致検索"),
    db: Client = Depends(get_supabase_client)
):
    try:
        query = db.from_('companies').select('*')
        if keyword:
            search_pattern = f"%{keyword}%"
            query = query.ilike('name', search_pattern)

        if industry:
            query = query.eq('industry', industry)
        
        response = query.limit(50).execute()
        return response.data

    except Exception as e:
        print(f"Supabase error (read_search_companies): {e}")
        raise HTTPException(status_code=500, detail=f"Database query failed: {e}")