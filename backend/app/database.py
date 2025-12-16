"""
Supabase（データベース）への接続設定とクライアント初期化
"""
from supabase import create_client, Client
from .config import SUPABASE_URL, SUPABASE_KEY

# Supabaseクライアントの初期化
def get_supabase_client() -> Client:
    # URLとキーがあるか確認
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Supabaseの認証情報が設定されていません")
    # supabaseをアプリ全体で使えるように返す
    return create_client(SUPABASE_URL, SUPABASE_KEY)

# Supabaseクライアントを取得
supabase = get_supabase_client() if SUPABASE_URL and SUPABASE_KEY else None
