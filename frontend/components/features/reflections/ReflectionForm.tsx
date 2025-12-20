'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { createReflection, updateReflection, type Reflection } from '@/app/companies/[id]/reflection_actions'

interface ReflectionFormProps {
  eventId: string
  existingReflection?: Reflection | null
  onSuccess?: () => void
  onCancel?: () => void
}

export default function ReflectionForm({
  eventId,
  existingReflection,
  onSuccess,
  onCancel,
}: ReflectionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selfScore, setSelfScore] = useState(existingReflection?.self_score || 3)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    try {
      const result = existingReflection
        ? await updateReflection(existingReflection.id, formData)
        : await createReflection(formData)

      if (result.success) {
        onSuccess?.()
      } else {
        setError(result.error || '保存に失敗しました')
      }
    } catch (err) {
      setError('予期しないエラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="event_id" value={eventId} />
      <input type="hidden" name="self_score" value={selfScore} />

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* 自己採点 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
          自己採点 <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((score) => (
            <button
              key={score}
              type="button"
              onClick={() => setSelfScore(score)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  score <= selfScore
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300 dark:text-slate-600'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-600 dark:text-slate-400">
            {selfScore === 5 && '非常に良かった'}
            {selfScore === 4 && '良かった'}
            {selfScore === 3 && '普通'}
            {selfScore === 2 && 'あまり良くなかった'}
            {selfScore === 1 && '悪かった'}
          </span>
        </div>
      </div>

      {/* 全体の感想 */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
          全体の感想
        </label>
        <textarea
          id="content"
          name="content"
          rows={4}
          defaultValue={existingReflection?.content || ''}
          className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
          placeholder="面接全体を通しての感想を記録しましょう..."
        />
      </div>

      {/* 良かった点 */}
      <div>
        <label htmlFor="good_points" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
          良かった点
        </label>
        <textarea
          id="good_points"
          name="good_points"
          rows={3}
          defaultValue={existingReflection?.good_points || ''}
          className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
          placeholder="うまくいった点を箇条書きで記録しましょう&#10;例：&#10;- 笑顔でハキハキと話せた&#10;- 質問に的確に答えられた"
        />
      </div>

      {/* 改善点 */}
      <div>
        <label htmlFor="bad_points" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
          改善点・反省点
        </label>
        <textarea
          id="bad_points"
          name="bad_points"
          rows={3}
          defaultValue={existingReflection?.bad_points || ''}
          className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
          placeholder="次回に向けて改善したい点を記録しましょう&#10;例：&#10;- 具体的な数値を用いた説明が不足&#10;- 逆質問をもっと準備すべきだった"
        />
      </div>

      {/* ボタン */}
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            キャンセル
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isSubmitting ? '保存中...' : existingReflection ? '更新する' : '保存する'}
        </button>
      </div>
    </form>
  )
}
