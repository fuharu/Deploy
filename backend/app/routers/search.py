"""
検索 API ルート（Google Custom Search & Places）
"""
from fastapi import APIRouter, HTTPException
from typing import List
from ..models.search import SearchRequest, SearchResponse, SearchResult, PlaceSearchRequest, Place
from ..services.google_api import search_company_info, search_nearby_places

router = APIRouter(prefix="/api/search", tags=["search"])

@router.post("/company", response_model=SearchResponse)
async def search_company(request: SearchRequest):
    """
    Google Custom Searchを使用して企業情報を検索
    """
    try:
        results = await search_company_info(request.query)
        return SearchResponse(results=results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/places", response_model=List[Place])
async def search_places(request: PlaceSearchRequest):
    """
    Google Places APIを使用して近くの場所（カフェ、レストラン）を検索
    """
    try:
        places = await search_nearby_places(request.location, request.radius)
        return places
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))