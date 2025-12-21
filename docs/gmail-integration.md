# Gmail連携機能

企業からのメールを自動的にチェックして通知する機能です。

## 機能概要

- Google OAuth 2.0を使用してGmailにアクセス
- 特定企業からのメールを検索・表示
- 未読メール数をリアルタイムで表示
- メール一覧の表示と既読管理

## 実装内容

### バックエンド

1. **Gmail Service** (`backend/app/services/gmail_service.py`)
   - Gmail API操作を管理するサービスクラス
   - メール検索、未読数取得、既読マーク機能

2. **Gmail Router** (`backend/app/routers/gmail.py`)
   - `/api/gmail/search` - メール検索
   - `/api/gmail/unread-count` - 未読数取得
   - `/api/gmail/mark-read` - 既読マーク

3. **依存関係** (`requirements.txt`)
   ```
   google-auth==2.27.0
   google-auth-oauthlib==1.2.0
   google-auth-httplib2==0.2.0
   google-api-python-client==2.116.0
   ```

### フロントエンド

1. **Gmail Actions** (`frontend/app/gmail/actions.ts`)
   - Server Actionsでバックエンドと通信

2. **Gmail Notification Component** (`frontend/components/features/gmail/GmailNotification.tsx`)
   - メール通知UIコンポーネント
   - 未読数バッジ表示
   - メール一覧の展開/折りたたみ

## セットアップ手順

### 1. Google Cloud Consoleでの設定

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成
3. Gmail APIを有効化
4. OAuth 2.0クライアントIDを作成
   - アプリケーションの種類: ウェブアプリケーション
   - 承認済みのリダイレクトURI: `http://localhost:3000/api/auth/callback/google`
5. クライアントIDとクライアントシークレットをメモ

### 2. 環境変数の設定

`.env`ファイルに以下を追加:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

### 3. OAuth認証フローの実装

フロントエンドでGoogle OAuth認証を実装し、取得した認証情報を以下の形式で保存:

```typescript
{
  token: string,
  refresh_token: string,
  token_uri: "https://oauth2.googleapis.com/token",
  client_id: string,
  client_secret: string,
  scopes: ["https://www.googleapis.com/auth/gmail.readonly"]
}
```

### 4. コンポーネントの使用

企業詳細ページで使用:

```tsx
import GmailNotification from '@/components/features/gmail/GmailNotification'

<GmailNotification
  companyName="株式会社Example"
  companyEmail="example.com"  // ドメインのみでもOK
  credentials={gmailCredentials}  // OAuth認証情報
/>
```

## 使用方法

### メール検索

```typescript
import { searchCompanyEmails } from '@/app/gmail/actions'

const emails = await searchCompanyEmails(
  credentials,
  '株式会社Example',  // 企業名
  'example.com',       // メールドメイン
  30,                  // 過去30日
  false                // 全てのメール（trueで未読のみ）
)
```

### 未読数取得

```typescript
import { getUnreadCount } from '@/app/gmail/actions'

const count = await getUnreadCount(
  credentials,
  '株式会社Example',
  'example.com'
)
```

## セキュリティ考慮事項

1. **OAuth認証情報の保存**
   - クライアント側でのセキュアな保存（暗号化推奨）
   - リフレッシュトークンの安全な管理

2. **アクセススコープ**
   - 最小限のスコープ（gmail.readonly）のみ使用
   - メール送信権限は不要

3. **CORS設定**
   - バックエンドでフロントエンドドメインのみ許可

## 今後の拡張案

- [ ] メール本文の表示
- [ ] メールの添付ファイル取得
- [ ] メールのラベル管理
- [ ] Webhook通知（リアルタイム更新）
- [ ] 複数アカウント対応
- [ ] メール検索フィルタの改善
