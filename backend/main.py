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

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI"}

@app.post("/api/search", response_model=List[SearchResult])
async def search_company(request: SearchRequest):
    if not GOOGLE_API_KEY or not SEARCH_ENGINE_ID:
        raise HTTPException(status_code=500, detail="API configurations are missing.")
    
    query = request.query
    # 企業公式サイトなどを優先するためにクエリを調整（例: "株式会社〇〇 採用" とか "株式会社〇〇 公式"）
    # ここではシンプルにそのまま検索し、クライアント側で調整、あるいは複数パターン検索も検討
    # 今回はシンプルに投げます。
    
    url = "https://www.googleapis.com/customsearch/v1"
    params = {
        "key": GOOGLE_API_KEY,
        "cx": SEARCH_ENGINE_ID,
        "q": query,
        "num": 3 # 上位3件取得
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
            
        except httpx.HTTPStatusError as e:
            print(f"Google API Error: {e}")
            raise HTTPException(status_code=e.response.status_code, detail="Failed to fetch search results")
        except Exception as e:
            print(f"Error: {e}")
            raise HTTPException(status_code=500, detail="Internal Server Error")
