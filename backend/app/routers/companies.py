"""
企業管理 API ルート
担当: はやと
"""

from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from typing import List, Dict, Any
from ..database import get_supabase_client

router = APIRouter()

@router.get("/campanies", response_model = List[Dict[str, Any]])
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