"""
Gmail API統合サービス
企業からのメールを取得して通知
"""
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import base64
import re

class GmailService:
    """Gmail API操作を管理するサービスクラス"""

    SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

    def __init__(self, credentials_dict: dict):
        """
        Args:
            credentials_dict: OAuth2認証情報の辞書
                {
                    "token": str,
                    "refresh_token": str,
                    "token_uri": str,
                    "client_id": str,
                    "client_secret": str,
                    "scopes": List[str]
                }
        """
        self.credentials = Credentials.from_authorized_user_info(credentials_dict, self.SCOPES)
        self.service = build('gmail', 'v1', credentials=self.credentials)

    def search_company_emails(
        self,
        company_name: str,
        company_email: Optional[str] = None,
        days_back: int = 30,
        only_unread: bool = False
    ) -> List[Dict]:
        """
        特定企業からのメールを検索

        Args:
            company_name: 企業名
            company_email: 企業のメールアドレス（ドメインでも可）
            days_back: 何日前まで遡るか
            only_unread: 未読メールのみ取得するか

        Returns:
            メール情報のリスト
        """
        try:
            # クエリを構築
            query_parts = []

            # 日付フィルタ
            after_date = (datetime.now() - timedelta(days=days_back)).strftime('%Y/%m/%d')
            query_parts.append(f'after:{after_date}')

            # 企業名またはメールアドレスでフィルタ
            if company_email:
                # ドメインの場合は from: を使用
                if '@' in company_email:
                    query_parts.append(f'from:{company_email}')
                else:
                    query_parts.append(f'from:@{company_email}')

            # 企業名でも検索（件名や本文に含まれる）
            if company_name:
                query_parts.append(f'"{company_name}"')

            # 未読フィルタ
            if only_unread:
                query_parts.append('is:unread')

            query = ' '.join(query_parts)

            # メール検索
            results = self.service.users().messages().list(
                userId='me',
                q=query,
                maxResults=50
            ).execute()

            messages = results.get('messages', [])

            # 詳細情報を取得
            email_list = []
            for message in messages:
                msg = self.service.users().messages().get(
                    userId='me',
                    id=message['id'],
                    format='full'
                ).execute()

                email_list.append(self._parse_message(msg))

            return email_list

        except HttpError as error:
            print(f'Gmail API Error: {error}')
            return []

    def get_unread_count(
        self,
        company_name: Optional[str] = None,
        company_email: Optional[str] = None
    ) -> int:
        """
        未読メール数を取得

        Args:
            company_name: 企業名（指定した場合、その企業のみ）
            company_email: 企業メールアドレス

        Returns:
            未読メール数
        """
        try:
            query_parts = ['is:unread']

            if company_email:
                if '@' in company_email:
                    query_parts.append(f'from:{company_email}')
                else:
                    query_parts.append(f'from:@{company_email}')

            if company_name:
                query_parts.append(f'"{company_name}"')

            query = ' '.join(query_parts)

            results = self.service.users().messages().list(
                userId='me',
                q=query
            ).execute()

            return results.get('resultSizeEstimate', 0)

        except HttpError as error:
            print(f'Gmail API Error: {error}')
            return 0

    def _parse_message(self, message: dict) -> Dict:
        """
        Gmail APIのメッセージをパース

        Args:
            message: Gmail APIから取得したメッセージ

        Returns:
            パースされたメール情報
        """
        headers = message['payload']['headers']

        # ヘッダーから情報抽出
        subject = ''
        from_email = ''
        date = ''

        for header in headers:
            if header['name'] == 'Subject':
                subject = header['value']
            elif header['name'] == 'From':
                from_email = header['value']
            elif header['name'] == 'Date':
                date = header['value']

        # 本文を取得
        snippet = message.get('snippet', '')

        # 未読かどうか
        is_unread = 'UNREAD' in message.get('labelIds', [])

        return {
            'id': message['id'],
            'thread_id': message['threadId'],
            'subject': subject,
            'from': from_email,
            'date': date,
            'snippet': snippet,
            'is_unread': is_unread,
            'timestamp': int(message['internalDate']) // 1000  # ミリ秒から秒に変換
        }

    def mark_as_read(self, message_id: str) -> bool:
        """
        メールを既読にする

        Args:
            message_id: メッセージID

        Returns:
            成功したかどうか
        """
        try:
            self.service.users().messages().modify(
                userId='me',
                id=message_id,
                body={'removeLabelIds': ['UNREAD']}
            ).execute()
            return True
        except HttpError as error:
            print(f'Gmail API Error: {error}')
            return False
