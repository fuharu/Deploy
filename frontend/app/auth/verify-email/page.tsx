import Link from 'next/link'
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react'

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-indigo-50 dark:border-white/10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 mb-4">
            <Mail className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">メールを確認してください</h1>
          <p className="text-sm text-gray-600 dark:text-slate-400">
            登録したメールアドレスに確認メールを送信しました
          </p>
        </div>

        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-indigo-900 dark:text-indigo-100">
              <p className="font-bold mb-1">次のステップ：</p>
              <ol className="list-decimal list-inside space-y-1 text-indigo-700 dark:text-indigo-300">
                <li>メールボックスを開く</li>
                <li>確認メールのリンクをクリック</li>
                <li>自動的にログインされます</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="space-y-3 text-sm text-gray-600 dark:text-slate-400">
          <p>
            <span className="font-medium text-gray-700 dark:text-slate-300">📧 メールが届かない場合：</span>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>迷惑メールフォルダを確認してください</li>
            <li>数分待ってから再度確認してください</li>
            <li>メールアドレスが正しいか確認してください</li>
          </ul>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-medium hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            ログイン画面に戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
