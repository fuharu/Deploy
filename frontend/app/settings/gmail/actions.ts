'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Gmail連携ステータスを取得
 */
export async function getGmailConnectionStatus() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { connected: false, email: null }
  }

  const { data, error } = await supabase
    .from('gmail_credentials')
    .select('created_at, expires_at')
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    return { connected: false, email: null }
  }

  // トークンの有効期限をチェック
  const expiresAt = new Date(data.expires_at)
  const isExpired = expiresAt < new Date()

  return {
    connected: !isExpired,
    email: user.email,
    connectedAt: data.created_at,
    expiresAt: data.expires_at,
    isExpired,
  }
}

/**
 * Gmail認証URLを生成
 */
export async function getGmailAuthUrl() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback/google`
  const scope = 'https://www.googleapis.com/auth/gmail.modify'

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  authUrl.searchParams.set('client_id', clientId!)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', scope)
  authUrl.searchParams.set('access_type', 'offline')
  authUrl.searchParams.set('prompt', 'consent')

  return authUrl.toString()
}

/**
 * Gmail連携を解除
 */
export async function disconnectGmail() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { error } = await supabase
    .from('gmail_credentials')
    .delete()
    .eq('user_id', user.id)

  if (error) {
    console.error('Failed to disconnect Gmail:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * 保存されたGmail認証情報を取得
 */
export async function getGmailCredentials() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('gmail_credentials')
    .select('access_token, refresh_token, token_uri, expires_at')
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    return null
  }

  // トークンが期限切れの場合はリフレッシュ
  const expiresAt = new Date(data.expires_at)
  if (expiresAt < new Date()) {
    // トークンをリフレッシュ
    const refreshed = await refreshGmailToken(data.refresh_token)
    if (refreshed) {
      return refreshed
    }
    return null
  }

  return {
    token: data.access_token,
    refresh_token: data.refresh_token,
    token_uri: data.token_uri,
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
    scopes: ['https://www.googleapis.com/auth/gmail.modify'],
  }
}

/**
 * トークンをリフレッシュ
 */
async function refreshGmailToken(refreshToken: string) {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (!response.ok) {
      console.error('Token refresh failed')
      return null
    }

    const tokens = await response.json()
    const { access_token, expires_in } = tokens

    // Supabaseを更新
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const expiresAt = new Date(Date.now() + expires_in * 1000)

      await supabase
        .from('gmail_credentials')
        .update({
          access_token,
          expires_at: expiresAt.toISOString(),
        })
        .eq('user_id', user.id)
    }

    return {
      token: access_token,
      refresh_token: refreshToken,
      token_uri: 'https://oauth2.googleapis.com/token',
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      scopes: ['https://www.googleapis.com/auth/gmail.modify'],
    }
  } catch (error) {
    console.error('Token refresh error:', error)
    return null
  }
}
