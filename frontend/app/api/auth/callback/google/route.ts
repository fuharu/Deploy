import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

/**
 * Google OAuth認証のコールバックエンドポイント
 *
 * フロー:
 * 1. Googleから認証コードを受け取る
 * 2. 認証コードをアクセストークンに交換
 * 3. トークンをSupabaseに保存
 * 4. ダッシュボードにリダイレクト
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const state = searchParams.get('state')

  // エラーチェック
  if (error) {
    console.error('OAuth error:', error)
    return NextResponse.redirect(new URL(`/?gmail_error=${error}`, request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?gmail_error=no_code', request.url))
  }

  try {
    // トークン交換
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback/google`,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Token exchange failed:', errorText)
      return NextResponse.redirect(new URL('/?gmail_error=token_exchange_failed', request.url))
    }

    const tokens = await tokenResponse.json()
    const { access_token, refresh_token, expires_in } = tokens

    if (!access_token || !refresh_token) {
      return NextResponse.redirect(new URL('/?gmail_error=invalid_tokens', request.url))
    }

    // Supabaseに保存
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/login?redirect=/dashboard', request.url))
    }

    // トークンの有効期限を計算
    const expiresAt = new Date(Date.now() + expires_in * 1000)

    // 既存の認証情報を削除してから新規作成（UPSERT）
    const { error: deleteError } = await supabase
      .from('gmail_credentials')
      .delete()
      .eq('user_id', user.id)

    const { error: insertError } = await supabase
      .from('gmail_credentials')
      .insert({
        user_id: user.id,
        access_token,
        refresh_token,
        token_uri: 'https://oauth2.googleapis.com/token',
        expires_at: expiresAt.toISOString(),
      })

    if (insertError) {
      console.error('Failed to save credentials:', insertError)
      return NextResponse.redirect(new URL('/?gmail_error=save_failed', request.url))
    }

    // 成功: ダッシュボードにリダイレクト
    return NextResponse.redirect(new URL('/?gmail_success=true', request.url))

  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.redirect(new URL('/?gmail_error=unknown', request.url))
  }
}
