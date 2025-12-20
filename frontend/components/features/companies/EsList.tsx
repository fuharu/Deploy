'use client'

import { useState, useRef } from 'react'
import { addESEntry, updateESEntry, deleteESEntry } from '@/app/companies/[id]/es_actions'
import { FileText, Edit, Trash2, CheckCircle2 } from 'lucide-react'

type ES = {
  id: string
  content: string | null
  file_url: string | null
  status: 'Draft' | 'Completed'
  created_at: string
  updated_at: string
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
        className="flex flex-col gap-3 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border dark:border-gray-700"
      >
          <input type="hidden" name="company_id" value={companyId} />
          <div className="flex flex-col gap-2">
            <textarea
                name="content"
                placeholder="ES内容を入力してください（例: 志望動機、自己PR等）..."
                rows={3}
                className="border dark:border-gray-600 rounded px-3 py-2 w-full text-sm dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
            <div className="flex flex-col gap-1">
              <input
                  name="file_url"
                  type="url"
                  placeholder="ファイルURL（Google DriveやDropboxにアップロードして共有リンクを貼り付けてください）"
                  className="border dark:border-gray-600 rounded px-3 py-2 w-full text-sm dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />
            </div>
          </div>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm font-medium w-full transition">
             追加
          </button>
      </form>

      <div className="flex flex-col gap-3">
        {initialEsList.map((es) => (
            <EsItem key={es.id} es={es} companyId={companyId} />
        ))}

        {initialEsList.length === 0 && (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-900/50 rounded border border-dashed border-gray-200 dark:border-gray-700">
                <div className="flex justify-center mb-2">
                    <FileText className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                </div>
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
  const [content, setContent] = useState(es.content || '')
  const [fileUrl, setFileUrl] = useState(es.file_url || '')

  if (isEditing) {
    return (
        <form
            action={async (formData) => {
                await updateESEntry(formData)
                setIsEditing(false)
            }}
            className="border dark:border-gray-700 p-4 rounded bg-white dark:bg-gray-800 flex flex-col gap-3"
        >
            <input type="hidden" name="id" value={es.id} />
            <input type="hidden" name="company_id" value={companyId} />

            <textarea
                name="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                className="border dark:border-gray-600 p-2 rounded w-full dark:bg-gray-700 dark:text-white"
                placeholder="ES内容を入力..."
            />

            <input
                name="file_url"
                type="url"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                className="border dark:border-gray-600 p-2 rounded w-full dark:bg-gray-700 dark:text-white"
                placeholder="ファイルURL（Google DriveやDropboxにアップロードして共有リンクを貼り付けてください）"
            />

            <div className="flex justify-between items-center text-sm">
                <div className="text-gray-500 dark:text-gray-400">
                    {content.length} 文字
                </div>
                <div className="flex gap-2">
                    <select name="status" defaultValue={es.status} className="border dark:border-gray-600 rounded px-2 dark:bg-gray-700 dark:text-white">
                        <option value="Draft">下書き</option>
                        <option value="Completed">完了</option>
                    </select>
                    <button type="button" onClick={() => setIsEditing(false)} className="text-gray-500 dark:text-gray-400">キャンセル</button>
                    <button type="submit" className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition">保存</button>
                </div>
            </div>
        </form>
    )
  }

  return (
    <div className="border dark:border-gray-700 p-4 rounded bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition group">
        <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap line-clamp-3">
                    {es.content || <span className="text-gray-400 dark:text-gray-600 italic">内容未入力</span>}
                </p>
                {es.file_url && (
                    <a href={es.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:underline mt-1 inline-block">
                        📎 添付ファイル
                    </a>
                )}
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                <button onClick={() => setIsEditing(true)} className="text-xs text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 p-1 rounded transition">
                    <Edit className="w-4 h-4" />
                </button>
                <form action={deleteESEntry}>
                    <input type="hidden" name="id" value={es.id} />
                    <input type="hidden" name="company_id" value={companyId} />
                    <button className="text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded transition">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
                {es.status === 'Completed' ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <FileText className="w-3 h-3 text-gray-400" />}
                {es.status === 'Completed' ? '完了' : '下書き'}
            </span>
            <span>{es.content?.length || 0} 文字</span>
        </div>
    </div>
  )
}

