"""
Google API 統合サービス
"""
import httpx
from typing import List, Optional
from ..config import GOOGLE_API_KEY, SEARCH_ENGINE_ID
from ..models.search import SearchResult, Place

async def search_company_info(query: str) -> List[SearchResult]:
    """
    Google Custom Search APIを使用して企業情報を検索
    """
    if not GOOGLE_API_KEY or not SEARCH_ENGINE_ID:
        return []

    url = "https://www.googleapis.com/customsearch/v1"
    params = {
        "key": GOOGLE_API_KEY,
        "cx": SEARCH_ENGINE_ID,
        "q": query,
        "num": 5
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            response.raise_for_status()

            data = response.json()
            results = []

            for item in data.get("items", [])[:5]:
                results.append(SearchResult(
                    title=item.get("title", ""),
                    link=item.get("link", ""),
                    snippet=item.get("snippet", "")
                ))

            return results
    except Exception as e:
        print(f"Google Search API Error: {e}")
        return []

async def search_nearby_places(location: str, radius: int = 500) -> List[Place]:
    """
    Google Places APIを使用して近くの場所を検索
    """
    if not GOOGLE_API_KEY:
        return []

    # 位置情報を解析（"lat,lng" 形式を想定）
    try:
        lat, lng = location.split(",")
        lat, lng = float(lat.strip()), float(lng.strip())
    except:
        return []

    url = "https://places.googleapis.com/v1/places:searchNearby"
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.id"
    }

    data = {
        "locationRestriction": {
            "circle": {
                "center": {"latitude": lat, "longitude": lng},
                "radius": radius
            }
        },
        "includedTypes": ["cafe", "coffee_shop"]
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=data, headers=headers)
            response.raise_for_status()

            places_data = response.json()
            places = []

            for place in places_data.get("places", []):
                places.append(Place(
                    name=place.get("displayName", {}).get("text", ""),
                    address=place.get("formattedAddress", ""),
                    rating=place.get("rating"),
                    user_ratings_total=place.get("userRatingCount"),
                    place_id=place.get("id", "")
                ))

            return places
    except Exception as e:
        print(f"Google Places API Error: {e}")
        return []