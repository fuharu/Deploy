'use server'

import { google } from 'googleapis'
import { getGmailCredentials } from '@/app/settings/gmail/actions'

export type EmailData = {
  id: string
  threadId: string
  subject: string
  from: string
  date: string
  snippet: string
  isUnread: boolean
  timestamp: number
}

/**
 * 企業からのメールを検索
 */
export async function searchCompanyEmails(
  companyName: string,
  companyEmail?: string,
  daysBack: number = 30,
  onlyUnread: boolean = false
) {
  try {
    const credentials = await getGmailCredentials()
    if (!credentials) {
      return { success: false, error: 'Gmail未連携', emails: [] }
    }

    const auth = new google.auth.OAuth2(
      credentials.client_id,
      credentials.client_secret,
      credentials.token_uri
    )

    auth.setCredentials({
      access_token: credentials.token,
      refresh_token: credentials.refresh_token,
    })

    const gmail = google.gmail({ version: 'v1', auth })

    // クエリを構築
    const queryParts = []

    // 日付フィルタ
    const afterDate = new Date()
    afterDate.setDate(afterDate.getDate() - daysBack)
    const formattedDate = afterDate.toISOString().split('T')[0].replace(/-/g, '/')
    queryParts.push(`after:${formattedDate}`)

    // 企業メールアドレスでフィルタ
    if (companyEmail) {
      if (companyEmail.includes('@')) {
        queryParts.push(`from:${companyEmail}`)
      } else {
        queryParts.push(`from:@${companyEmail}`)
      }
    }

    // 企業名でも検索
    if (companyName) {
      queryParts.push(`"${companyName}"`)
    }

    // 未読フィルタ
    if (onlyUnread) {
      queryParts.push('is:unread')
    }

    const query = queryParts.join(' ')

    // メール検索
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 50,
    })

    const messages = response.data.messages || []

    // 詳細情報を取得
    const emailList: EmailData[] = []
    for (const message of messages) {
      const msg = await gmail.users.messages.get({
        userId: 'me',
        id: message.id!,
        format: 'full',
      })

      const headers = msg.data.payload?.headers || []
      const subject = headers.find(h => h.name === 'Subject')?.value || ''
      const from = headers.find(h => h.name === 'From')?.value || ''
      const date = headers.find(h => h.name === 'Date')?.value || ''
      const snippet = msg.data.snippet || ''
      const isUnread = msg.data.labelIds?.includes('UNREAD') || false

      emailList.push({
        id: msg.data.id!,
        threadId: msg.data.threadId!,
        subject,
        from,
        date,
        snippet,
        isUnread,
        timestamp: parseInt(msg.data.internalDate || '0') / 1000,
      })
    }

    return { success: true, emails: emailList }
  } catch (error) {
    console.error('Failed to search emails:', error)
    return { success: false, error: 'メール検索失敗', emails: [] }
  }
}

/**
 * 未読メール数を取得
 */
export async function getUnreadCount(companyName?: string, companyEmail?: string) {
  try {
    const credentials = await getGmailCredentials()
    if (!credentials) {
      return { success: false, count: 0 }
    }

    const auth = new google.auth.OAuth2(
      credentials.client_id,
      credentials.client_secret,
      credentials.token_uri
    )

    auth.setCredentials({
      access_token: credentials.token,
      refresh_token: credentials.refresh_token,
    })

    const gmail = google.gmail({ version: 'v1', auth })

    const queryParts = ['is:unread']

    if (companyEmail) {
      if (companyEmail.includes('@')) {
        queryParts.push(`from:${companyEmail}`)
      } else {
        queryParts.push(`from:@${companyEmail}`)
      }
    }

    if (companyName) {
      queryParts.push(`"${companyName}"`)
    }

    const query = queryParts.join(' ')

    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
    })

    return { success: true, count: response.data.resultSizeEstimate || 0 }
  } catch (error) {
    console.error('Failed to get unread count:', error)
    return { success: false, count: 0 }
  }
}

/**
 * メールを既読にする
 */
export async function markEmailAsRead(messageId: string) {
  try {
    const credentials = await getGmailCredentials()
    if (!credentials) {
      return { success: false, error: 'Gmail未連携' }
    }

    const auth = new google.auth.OAuth2(
      credentials.client_id,
      credentials.client_secret,
      credentials.token_uri
    )

    auth.setCredentials({
      access_token: credentials.token,
      refresh_token: credentials.refresh_token,
    })

    const gmail = google.gmail({ version: 'v1', auth })

    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        removeLabelIds: ['UNREAD'],
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to mark email as read:', error)
    return { success: false, error: 'メール既読化失敗' }
  }
}
