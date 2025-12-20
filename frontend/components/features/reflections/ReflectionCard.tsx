'use client'

import { useState } from 'react'
import { Star, Edit2, Trash2, Calendar, Building2 } from 'lucide-react'
import { deleteReflection, type Reflection } from '@/app/companies/[id]/reflection_actions'
import ReflectionForm from './ReflectionForm'

interface ReflectionCardProps {
  reflection: Reflection
  onUpdate?: () => void
}

export default function ReflectionCard({ reflection, onUpdate }: ReflectionCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('この振り返りを削除してもよろしいですか？')) {
      return
    }

    setIsDeleting(true)
    const result = await deleteReflection(reflection.id)

    if (result.success) {
      onUpdate?.()
    } else {
      alert(result.error || '削除に失敗しました')
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return '今日'
    if (diffDays === 1) return '昨日'
    if (diffDays < 7) return `${diffDays}日前`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`
    return date.toLocaleDateString('ja-JP')
  }

  if (isEditing) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">振り返りを編集</h3>
        <ReflectionForm
          eventId={reflection.event_id}
          existingReflection={reflection}
          onSuccess={() => {
            setIsEditing(false)
            onUpdate?.()
          }}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow">
      {/* ヘッダー */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {/* イベント情報 */}
          {reflection.events && (
            <div className="space-y-1 mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {reflection.events.title}
              </h3>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-slate-400">
                {reflection.events.companies && (
                  <div className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    <span>{reflection.events.companies.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(reflection.events.start_time).toLocaleDateString('ja-JP')}</span>
                </div>
              </div>
            </div>
          )}

          {/* 自己採点 */}
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((score) => (
              <Star
                key={score}
                className={`w-5 h-5 ${
                  score <= (reflection.self_score || 0)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300 dark:text-slate-600'
                }`}
              />
            ))}
            <span className="text-sm text-gray-600 dark:text-slate-400 ml-1">
              ({reflection.self_score}/5)
            </span>
          </div>
        </div>

        {/* アクション */}
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
            title="編集"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-gray-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
            title="削除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 内容 */}
      <div className="space-y-4">
        {/* 全体の感想 */}
        {reflection.content && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">全体の感想</h4>
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{reflection.content}</p>
          </div>
        )}

        {/* 良かった点 */}
        {reflection.good_points && (
          <div>
            <h4 className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">✓ 良かった点</h4>
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap bg-green-50 dark:bg-green-900/10 rounded-lg p-3 border-l-4 border-green-500">
              {reflection.good_points}
            </p>
          </div>
        )}

        {/* 改善点 */}
        {reflection.bad_points && (
          <div>
            <h4 className="text-sm font-medium text-yellow-700 dark:text-yellow-400 mb-1">⚠ 改善点・反省点</h4>
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap bg-yellow-50 dark:bg-yellow-900/10 rounded-lg p-3 border-l-4 border-yellow-500">
              {reflection.bad_points}
            </p>
          </div>
        )}
      </div>

      {/* フッター */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
        <p className="text-xs text-gray-500 dark:text-slate-500">
          {formatDate(reflection.created_at)}に記録
        </p>
      </div>
    </div>
  )
}
