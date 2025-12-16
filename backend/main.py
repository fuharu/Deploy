"""
バックエンドアプリケーションのエントリーポイント
実行方法: uvicorn main:app --reload
"""
from app.main import app

# uvicorn main:app で実行できるようにする
__all__ = ["app"]