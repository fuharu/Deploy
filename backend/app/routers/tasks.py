"""
Todo/タスク管理 API ルート
担当: はると（フロント）/ はやと（バック）
"""
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from ..models.task import Task, TaskCreate, TaskUpdate
from ..database import supabase

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

@router.get("/", response_model=List[Task])
async def get_tasks(
    user_id: str = "test-user",
    company_id: Optional[int] = None,
    is_completed: Optional[bool] = None
):
    """
    オプションのフィルタ付きでタスクを取得
    """
    if not supabase:
        return []

    try:
        query = supabase.table("tasks").select("*, companies(name)").eq("user_id", user_id)

        if company_id is not None:
            query = query.eq("company_id", company_id)
        if is_completed is not None:
            query = query.eq("is_completed", is_completed)

        response = query.order("due_date").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=Task)
async def create_task(task: TaskCreate, user_id: str = "test-user"):
    """
    新しいタスクを作成
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not connected")

    try:
        data = task.dict()
        data["user_id"] = user_id
        response = supabase.table("tasks").insert(data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{task_id}", response_model=Task)
async def update_task(task_id: int, task: TaskUpdate, user_id: str = "test-user"):
    """
    タスクを更新
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not connected")

    try:
        data = task.dict(exclude_unset=True)
        response = supabase.table("tasks").update(data).eq("id", task_id).eq("user_id", user_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Task not found")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{task_id}")
async def delete_task(task_id: int, user_id: str = "test-user"):
    """
    タスクを削除
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not connected")

    try:
        response = supabase.table("tasks").delete().eq("id", task_id).eq("user_id", user_id).execute()
        return {"message": "Task deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{task_id}/complete")
async def toggle_task_completion(task_id: int, user_id: str = "test-user"):
    """
    タスクの完了状態を切り替え
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not connected")

    try:
        # 現在の状態を取得
        current = supabase.table("tasks").select("is_completed").eq("id", task_id).eq("user_id", user_id).execute()
        if not current.data:
            raise HTTPException(status_code=404, detail="Task not found")

        # 状態を切り替え
        new_status = not current.data[0]["is_completed"]
        response = supabase.table("tasks").update({"is_completed": new_status}).eq("id", task_id).eq("user_id", user_id).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))