export interface AppError {
  message: string
  code?: string
  statusCode?: number
}

export class AppError extends Error {
  code?: string
  statusCode?: number

  constructor(message: string, code?: string, statusCode?: number) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
  }
}

export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error
  }

  if (error instanceof Error) {
    // Supabase errors
    if ('code' in error && 'message' in error) {
      return new AppError(
        error.message as string,
        (error as any).code,
        (error as any).statusCode
      )
    }

    return new AppError(error.message)
  }

  if (typeof error === 'string') {
    return new AppError(error)
  }

  return new AppError('予期しないエラーが発生しました')
}

export function getErrorMessage(error: unknown): string {
  const appError = handleError(error)
  
  // User-friendly error messages
  const errorMessages: { [key: string]: string } = {
    '23505': 'このデータは既に存在します',
    '23503': '関連するデータが存在しないため、この操作は実行できません',
    'PGRST116': 'データが見つかりません',
    'Unauthorized': '認証が必要です。ログインしてください',
    'Forbidden': 'この操作を実行する権限がありません',
  }

  if (appError.code && errorMessages[appError.code]) {
    return errorMessages[appError.code]
  }

  return appError.message
}

export function logError(error: unknown, context?: string) {
  const appError = handleError(error)
  
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context || 'Error'}]`, {
      message: appError.message,
      code: appError.code,
      statusCode: appError.statusCode,
      stack: appError.stack,
    })
  } else {
    // In production, you might want to send to an error tracking service
    console.error(`[${context || 'Error'}]`, appError.message)
  }
}

