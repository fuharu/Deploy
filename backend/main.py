import os
import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import List, Optional

load_dotenv()

app = FastAPI()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
SEARCH_ENGINE_ID = os.getenv("SEARCH_ENGINE_ID")

class SearchRequest(BaseModel):
    query: str

class SearchResult(BaseModel):
    title: str
    link: str
    snippet: str

class PlaceRequest(BaseModel):
    location: str # "渋谷駅" や "東京都港区..." など

class PlaceResult(BaseModel):
    name: str
    address: str
    rating: Optional[float] = None
    user_ratings_total: Optional[int] = None
    open_now: Optional[bool] = None
    photo_reference: Optional[str] = None

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI"}

@app.post("/api/search", response_model=List[SearchResult])
async def search_company(request: SearchRequest):
    # ... (既存コード) ...
    if not GOOGLE_API_KEY or not SEARCH_ENGINE_ID:
        raise HTTPException(status_code=500, detail="API configurations are missing.")
    
    query = request.query
    url = "https://www.googleapis.com/customsearch/v1"
    params = {
        "key": GOOGLE_API_KEY,
        "cx": SEARCH_ENGINE_ID,
        "q": query,
        "num": 3
    }
    
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
            
            items = data.get("items", [])
            results = []
            for item in items:
                results.append(SearchResult(
                    title=item.get("title", ""),
                    link=item.get("link", ""),
                    snippet=item.get("snippet", "")
                ))
            return results
        except Exception as e:
            print(f"Error: {e}")
            raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/places/search", response_model=List[PlaceResult])
async def search_cafes(request: PlaceRequest):
    if not GOOGLE_API_KEY:
        raise HTTPException(status_code=500, detail="GOOGLE_API_KEY is missing.")

    # Places API (Text Search New) を使用
    # https://places.googleapis.com/v1/places:searchText
    url = "https://places.googleapis.com/v1/places:searchText"
    
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.regularOpeningHours,places.photos"
    }
    
    # "location + カフェ" で検索
    search_query = f"{request.location} カフェ"
    
    payload = {
        "textQuery": search_query,
        "maxResultCount": 5,
        "languageCode": "ja"
    }

    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(url, json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            
            places = data.get("places", [])
            results = []
            for place in places:
                photo_ref = None
                if place.get("photos") and len(place["photos"]) > 0:
                    photo_ref = place["photos"][0].get("name") # "places/PLACE_ID/photos/PHOTO_ID"

                # 営業中かどうか (簡易判定)
                open_now = place.get("regularOpeningHours", {}).get("openNow", None)

                results.append(PlaceResult(
                    name=place.get("displayName", {}).get("text", "Unknown"),
                    address=place.get("formattedAddress", ""),
                    rating=place.get("rating"),
                    user_ratings_total=place.get("userRatingCount"),
                    open_now=open_now,
                    photo_reference=photo_ref
                ))
            return results
            
        except httpx.HTTPStatusError as e:
            print(f"Places API Error: {e.response.text}")
            raise HTTPException(status_code=e.response.status_code, detail="Failed to fetch places")
        except Exception as e:
            print(f"Error: {e}")
            raise HTTPException(status_code=500, detail="Internal Server Error")
