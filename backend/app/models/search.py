"""
検索関連のモデル（Google API）
"""
from pydantic import BaseModel
from typing import List, Optional

class SearchRequest(BaseModel):
    query: str

class SearchResult(BaseModel):
    title: str
    link: str
    snippet: str

class SearchResponse(BaseModel):
    results: List[SearchResult]

class Place(BaseModel):
    name: str
    address: Optional[str]
    rating: Optional[float]
    user_ratings_total: Optional[int]
    place_id: str

class PlaceSearchRequest(BaseModel):
    location: str
    radius: int = 500  # meters