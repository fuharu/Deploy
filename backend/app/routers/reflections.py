"""
振り返りログ API ルート
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, List, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel
from ..database import supabase

router = APIRouter(prefix="/api/reflections", tags=["reflections"])


# リクエストモデル
class ReflectionCreateRequest(BaseModel):
    event_id: UUID
    content: Optional[str] = None
    good_points: Optional[str] = None
    bad_points: Optional[str] = None
    self_score: Optional[int] = None


@router.get("")
async def get_reflections(
    user_id: Optional[UUID] = Query(None, description="ユーザーID"),
    event_id: Optional[UUID] = Query(None, description="イベントID"),
    limit: int = Query(50, description="取得件数上限")
) -> Dict[str, Any]:
    """
    振り返りを取得

    - user_id指定時: そのユーザーの全振り返り
    - event_id指定時: そのイベントの振り返り（1件のみ）
    - どちらも指定なし: エラー
    """
    if not user_id and not event_id:
        raise HTTPException(status_code=400, detail="user_id または event_id を指定してください")

    try:
        query = supabase.table("reflections").select(
            "*, events(id, title, type, start_time, end_time, company_id, companies(name))"
        )

        if event_id:
            # イベント指定の場合
            response = query.eq("event_id", str(event_id)).execute()

            if not response.data:
                return {
                    "reflections": [],
                    "total_count": 0
                }

            return {
                "reflections": response.data,
                "total_count": len(response.data)
            }

        if user_id:
            # ユーザー指定の場合、eventsテーブル経由でフィルタリング
            # まずユーザーのイベントIDを取得
            user_events = supabase.table("userevents").select("event_id").eq(
                "user_id", str(user_id)
            ).execute()

            if not user_events.data:
                return {
                    "reflections": [],
                    "total_count": 0
                }

            event_ids = [ue["event_id"] for ue in user_events.data]

            # そのイベントIDに紐づく振り返りを取得
            response = query.in_("event_id", event_ids).order(
                "created_at", desc=True
            ).limit(limit).execute()

            return {
                "reflections": response.data,
                "total_count": len(response.data)
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"振り返りの取得に失敗しました: {str(e)}")


@router.get("/{reflection_id}")
async def get_reflection(reflection_id: UUID) -> Dict[str, Any]:
    """
    特定の振り返りを取得
    """
    try:
        response = supabase.table("reflections").select(
            "*, events(id, title, type, start_time, end_time, company_id, companies(name))"
        ).eq("id", str(reflection_id)).execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="振り返りが見つかりません")

        return response.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"振り返りの取得に失敗しました: {str(e)}")


@router.post("")
async def create_reflection(reflection: ReflectionCreateRequest) -> Dict[str, Any]:
    """
    振り返りを作成
    """
    try:
        # イベントの存在確認
        event_check = supabase.table("events").select("id").eq(
            "id", str(reflection.event_id)
        ).execute()

        if not event_check.data:
            raise HTTPException(status_code=404, detail="イベントが見つかりません")

        # 既に振り返りが存在するか確認（1対1制約）
        existing = supabase.table("reflections").select("id").eq(
            "event_id", str(reflection.event_id)
        ).execute()

        if existing.data:
            raise HTTPException(
                status_code=400,
                detail="このイベントには既に振り返りが存在します"
            )

        # 振り返り作成
        data = {
            "event_id": str(reflection.event_id),
            "content": reflection.content,
            "good_points": reflection.good_points,
            "bad_points": reflection.bad_points,
            "self_score": reflection.self_score
        }

        response = supabase.table("reflections").insert(data).execute()

        if not response.data:
            raise HTTPException(status_code=500, detail="振り返りの作成に失敗しました")

        return {
            "message": "振り返りを作成しました",
            "reflection": response.data[0]
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"振り返りの作成に失敗しました: {str(e)}")


@router.put("/{reflection_id}")
async def update_reflection(
    reflection_id: UUID,
    reflection: ReflectionCreateRequest
) -> Dict[str, Any]:
    """
    振り返りを更新
    """
    try:
        # 振り返りの存在確認
        existing = supabase.table("reflections").select("id").eq(
            "id", str(reflection_id)
        ).execute()

        if not existing.data:
            raise HTTPException(status_code=404, detail="振り返りが見つかりません")

        # 更新データ
        data = {
            "content": reflection.content,
            "good_points": reflection.good_points,
            "bad_points": reflection.bad_points,
            "self_score": reflection.self_score
        }

        response = supabase.table("reflections").update(data).eq(
            "id", str(reflection_id)
        ).execute()

        if not response.data:
            raise HTTPException(status_code=500, detail="振り返りの更新に失敗しました")

        return {
            "message": "振り返りを更新しました",
            "reflection": response.data[0]
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"振り返りの更新に失敗しました: {str(e)}")


@router.delete("/{reflection_id}")
async def delete_reflection(reflection_id: UUID) -> Dict[str, str]:
    """
    振り返りを削除
    """
    try:
        # 振り返りの存在確認
        existing = supabase.table("reflections").select("id").eq(
            "id", str(reflection_id)
        ).execute()

        if not existing.data:
            raise HTTPException(status_code=404, detail="振り返りが見つかりません")

        # 削除
        supabase.table("reflections").delete().eq(
            "id", str(reflection_id)
        ).execute()

        return {"message": "振り返りを削除しました"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"振り返りの削除に失敗しました: {str(e)}")
