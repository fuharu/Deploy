"""
Gmail API連携ルーター
OAuth認証とメール取得機能を提供
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict
from ..services.gmail_service import GmailService

router = APIRouter(prefix="/api/gmail", tags=["Gmail"])

class GmailCredentials(BaseModel):
    """Gmail OAuth認証情報"""
    token: str
    refresh_token: str
    token_uri: str
    client_id: str
    client_secret: str
    scopes: List[str]

class EmailSearchRequest(BaseModel):
    """メール検索リクエスト"""
    credentials: Dict
    company_name: Optional[str] = None
    company_email: Optional[str] = None
    days_back: int = 30
    only_unread: bool = False

class UnreadCountRequest(BaseModel):
    """未読メール数取得リクエスト"""
    credentials: Dict
    company_name: Optional[str] = None
    company_email: Optional[str] = None

class MarkAsReadRequest(BaseModel):
    """既読マークリクエスト"""
    credentials: Dict
    message_id: str

class EmailResponse(BaseModel):
    """メール情報レスポンス"""
    id: str
    thread_id: str
    subject: str
    from_address: str = ""
    date: str
    snippet: str
    is_unread: bool
    timestamp: int

@router.post("/search", response_model=List[EmailResponse])
async def search_company_emails(request: EmailSearchRequest):
    """
    企業からのメールを検索

    - **credentials**: OAuth2認証情報
    - **company_name**: 企業名（オプション）
    - **company_email**: 企業メールアドレスまたはドメイン（オプション）
    - **days_back**: 何日前まで遡るか（デフォルト: 30日）
    - **only_unread**: 未読のみ取得（デフォルト: False）
    """
    try:
        gmail_service = GmailService(request.credentials)
        emails = gmail_service.search_company_emails(
            company_name=request.company_name,
            company_email=request.company_email,
            days_back=request.days_back,
            only_unread=request.only_unread
        )

        # レスポンス形式に変換
        return [
            EmailResponse(
                id=email['id'],
                thread_id=email['thread_id'],
                subject=email['subject'],
                from_address=email['from'],
                date=email['date'],
                snippet=email['snippet'],
                is_unread=email['is_unread'],
                timestamp=email['timestamp']
            )
            for email in emails
        ]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gmail API error: {str(e)}")

@router.post("/unread-count")
async def get_unread_count(request: UnreadCountRequest) -> Dict[str, int]:
    """
    未読メール数を取得

    - **credentials**: OAuth2認証情報
    - **company_name**: 企業名（オプション）
    - **company_email**: 企業メールアドレスまたはドメイン（オプション）
    """
    try:
        gmail_service = GmailService(request.credentials)
        count = gmail_service.get_unread_count(
            company_name=request.company_name,
            company_email=request.company_email
        )

        return {"count": count}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gmail API error: {str(e)}")

@router.post("/mark-read")
async def mark_as_read(request: MarkAsReadRequest) -> Dict[str, bool]:
    """
    メールを既読にする

    - **credentials**: OAuth2認証情報
    - **message_id**: メッセージID
    """
    try:
        gmail_service = GmailService(request.credentials)
        success = gmail_service.mark_as_read(request.message_id)

        return {"success": success}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gmail API error: {str(e)}")
