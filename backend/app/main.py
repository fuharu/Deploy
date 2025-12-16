"""
FastAPIアプリケーションのメインエントリーポイント
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# エンドポイントのインポート
# from .routers import (
#     search, # 検索機能
#     reminders, # リマインダー機能
#     companies, # 企業管理
#     events, # イベント/カレンダー管理
#     tasks, # Todoリスト管理
#     es_entries # ES管理
# )
# # すべてのAPIが /api プレフィックスを持つように設定
# from .config import API_PREFIX

# アプリケーション作成
app = FastAPI(
    title="Deploy Backend API",
    description="Job Hunting Support App Backend",
    version="1.0.0"
)

# CORS middlewareの設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # localhost:3000 からのアクセスを許可
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/")
def read_root():
    return {
        "message": "Deploy Backend API is running",
        "version": "1.0.0"
    }

@app.on_event("startup")
async def startup_event():
    from .database import supabase
    try:
        if supabase:
            # Simple check
            response = supabase.table("users").select("*", count="exact").limit(1).execute()
            print("✅ Supabase Client connection successful")
        else:
            print("⚠️ Supabase client not initialized (missing env vars?)")
    except Exception as e:
        print(f"❌ Supabase Client connection failed: {e}")


# APIエンドポイントをappに組み込む
# たいが担当
# リマインダー機能
# app.include_router(reminders.router)

# # はやと担当
# # 企業管理、イベント/カレンダー、ES管理
# app.include_router(companies.router)
# app.include_router(events.router)
# app.include_router(es_entries.router)

# # はると・はやと担当
# # Todoリスト
# app.include_router(tasks.router)

# # 共通機能
# app.include_router(search.router)
