'use client'

import { useState, useRef } from 'react'
import { addESEntry, updateESEntry, deleteESEntry } from '@/app/companies/[id]/es_actions'

type ES = {
  id: string
  question: string
  answer: string | null
  max_chars: number | null
  status: 'Draft' | 'Completed'
}

export default function EsList({ 
  companyId, 
  initialEsList 
}: { 
  companyId: string, 
  initialEsList: ES[] 
}) {
  const formRef = useRef<HTMLFormElement>(null)
  
  return (
    <div className="flex flex-col gap-4">
      {/* 常時表示の追加フォーム */}
      <form 
        ref={formRef}
        action={async (formData) => {
            await addESEntry(formData)
            formRef.current?.reset()
        }} 
        className="flex gap-2"
      >
          <input type="hidden" name="company_id" value={companyId} />
          <div className="flex-1">
            <input 
                name="question" 
                placeholder="新しい設問を追加 (例: 志望動機)..." 
                required 
                className="border dark:border-gray-600 rounded px-3 py-2 w-full text-sm dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" 
            />
          </div>
          <input 
             name="max_chars" 
             type="number" 
             placeholder="文字数" 
             className="border dark:border-gray-600 rounded px-2 py-2 text-sm w-20 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" 
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium whitespace-nowrap transition">
             追加
          </button>
      </form>

      <div className="flex flex-col gap-3">
        {initialEsList.map((es) => (
            <EsItem key={es.id} es={es} companyId={companyId} />
        ))}

        {initialEsList.length === 0 && (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-900/50 rounded border border-dashed border-gray-200 dark:border-gray-700">
                <div className="text-2xl mb-2 opacity-50">📝</div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    ESはまだありません。<br/>上のフォームから設問を追加してください。
                </p>
            </div>
        )}
      </div>
    </div>
  )
}

function EsItem({ es, companyId }: { es: ES, companyId: string }) {
  const [isEditing, setIsEditing] = useState(false)
  const [answer, setAnswer] = useState(es.answer || '')
  
  const charCount = answer.length
  const isOverLimit = es.max_chars && charCount > es.max_chars

  if (isEditing) {
    return (
        <form 
            action={async (formData) => {
                await updateESEntry(formData)
                setIsEditing(false)
            }}
            className="border p-4 rounded bg-white flex flex-col gap-2"
        >
            <input type="hidden" name="id" value={es.id} />
            <input type="hidden" name="company_id" value={companyId} />
            
            <div className="font-medium mb-1">{es.question}</div>
            
            <textarea 
                name="answer" 
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={5}
                className="border p-2 rounded w-full"
                placeholder="回答を入力..."
            />
            
            <div className="flex justify-between items-center text-sm">
                <div className={`${isOverLimit ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                    {charCount} / {es.max_chars || '∞'} 文字
                </div>
                <div className="flex gap-2">
                    <select name="status" defaultValue={es.status} className="border rounded px-2">
                        <option value="Draft">下書き</option>
                        <option value="Completed">完了</option>
                    </select>
                    <button type="button" onClick={() => setIsEditing(false)} className="text-gray-500">キャンセル</button>
                    <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">保存</button>
                </div>
            </div>
        </form>
    )
  }

  return (
    <div className="border p-4 rounded bg-white dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition group">
        <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium dark:text-gray-200">{es.question}</h3>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                <button onClick={() => setIsEditing(true)} className="text-xs text-blue-500 hover:underline">編集</button>
                <form action={deleteESEntry}>
                    <input type="hidden" name="id" value={es.id} />
                    <input type="hidden" name="company_id" value={companyId} />
                    <button className="text-xs text-red-500 hover:underline">削除</button>
                </form>
            </div>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap line-clamp-3">
            {es.answer || <span className="text-gray-400 dark:text-gray-600 italic">回答未入力</span>}
        </p>
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span>{es.status === 'Completed' ? '✅ 完了' : '📝 下書き'}</span>
            <span>{es.answer?.length || 0} / {es.max_chars || '∞'} 文字</span>
        </div>
    </div>
  )
}

