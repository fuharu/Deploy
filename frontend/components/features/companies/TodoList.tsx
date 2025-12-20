'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { addTask, toggleTask, deleteTask } from '@/app/companies/[id]/todo_actions'
import { CheckCircle2, X } from 'lucide-react'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useToast } from '@/components/providers/ToastProvider'

type Task = {
  id: string
  title: string
  due_date: string | null
  is_completed: boolean
}

export default function TodoList({
  companyId,
  initialTasks
}: {
  companyId: string,
  initialTasks: Task[]
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const router = useRouter()
  const { showSuccess, showError } = useToast()

  const handleAddTask = async (formData: FormData) => {
    const title = formData.get('title') as string
    const due_date = formData.get('due_date') as string || null

    // オプティミスティック更新
    const tempId = `temp-${Date.now()}`
    const newTask: Task = {
      id: tempId,
      title,
      due_date,
      is_completed: false,
    }
    setTasks((prev) => [...prev, newTask])
    formRef.current?.reset()

    try {
      await addTask(formData)
      showSuccess('タスクを追加しました')
      router.refresh()
    } catch (error) {
      // ロールバック
      setTasks((prev) => prev.filter((t) => t.id !== tempId))
      showError('タスクの追加に失敗しました')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 常時表示の追加フォーム */}
      <form
        ref={formRef}
        action={handleAddTask}
        className="flex flex-wrap gap-2"
      >
        <input type="hidden" name="company_id" value={companyId} />
        <div className="flex-1 relative min-w-[200px]">
          <input
            name="title"
            placeholder="新しいタスクを追加..."
            required
            className="border dark:border-gray-600 rounded px-3 py-2 w-full text-sm dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          />
        </div>
        <input
          name="due_date"
          type="date"
          className="border dark:border-gray-600 rounded px-2 py-2 text-sm w-32 dark:bg-gray-700 dark:text-white"
        />
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm font-medium whitespace-nowrap transition">
          追加
        </button>
      </form>

      <div className="flex flex-col gap-2">
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} companyId={companyId} setTasks={setTasks} />
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-900/50 rounded border border-dashed border-gray-200 dark:border-gray-700">
            <div className="flex justify-center mb-2">
              <CheckCircle2 className="w-8 h-8 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              タスクはまだありません。<br />上のフォームから追加できます。
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function TaskItem({ task, companyId, setTasks }: { task: Task, companyId: string, setTasks: React.Dispatch<React.SetStateAction<Task[]>> }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { showSuccess, showError } = useToast()

  const handleToggle = async (checked: boolean) => {
    // オプティミスティック更新
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, is_completed: checked } : t))

    try {
      await toggleTask(task.id, checked, companyId)
      router.refresh()
    } catch (error) {
      // ロールバック
      setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, is_completed: !checked } : t))
      showError('タスクの更新に失敗しました')
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    const taskId = task.id

    // オプティミスティック更新
    setTasks((prev) => prev.filter((t) => t.id !== taskId))

    try {
      const formData = new FormData()
      formData.append('id', task.id)
      formData.append('company_id', companyId)
      await deleteTask(formData)
      showSuccess('タスクを削除しました')
      router.refresh()
    } catch (error) {
      // ロールバック
      setTasks((prev) => [...prev, task])
      showError('削除に失敗しました')
      console.error('Delete error:', error)
    } finally {
      setIsDeleting(false)
      setIsOpen(false)
    }
  }

  return (
    <>
      <div className={`flex items-center gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition group ${task.is_completed ? 'opacity-50' : ''}`}>
        <input
          type="checkbox"
          checked={task.is_completed}
          onChange={(e) => handleToggle(e.target.checked)}
          className="w-4 h-4 cursor-pointer"
        />
        <div className="flex-1 min-w-0">
          <div className={`text-sm dark:text-gray-200 ${task.is_completed ? 'line-through text-gray-500 dark:text-gray-500' : ''}`}>
            {task.title}
          </div>
          {task.due_date && (
            <div className="text-xs text-gray-400 dark:text-gray-500">
              期限: {new Date(task.due_date).toLocaleDateString()}
            </div>
          )}
        </div>
        <button
          onClick={() => setIsOpen(true)}
          disabled={isDeleting}
          className="opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <ConfirmDialog
        isOpen={isOpen}
        title="タスクを削除しますか？"
        message={`「${task.title}」を削除します。この操作は取り消せません。`}
        confirmText="削除する"
        cancelText="キャンセル"
        onConfirm={handleDelete}
        onCancel={() => setIsOpen(false)}
        variant="danger"
      />
    </>
  )
}

