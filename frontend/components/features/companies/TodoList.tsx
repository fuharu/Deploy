'use client'

import { useRef } from 'react'
import { addTask, toggleTask, deleteTask } from '@/app/companies/[id]/todo_actions'
import { CheckCircle2, X } from 'lucide-react'

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
  
  return (
    <div className="flex flex-col gap-4">
      {/* 常時表示の追加フォーム */}
      <form 
        ref={formRef}
        action={async (formData) => {
            await addTask(formData)
            formRef.current?.reset()
        }} 
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
        {initialTasks.map((task) => (
            <TaskItem key={task.id} task={task} companyId={companyId} />
        ))}

        {initialTasks.length === 0 && (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-900/50 rounded border border-dashed border-gray-200 dark:border-gray-700">
                <div className="flex justify-center mb-2">
                    <CheckCircle2 className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    タスクはまだありません。<br/>上のフォームから追加できます。
                </p>
            </div>
        )}
      </div>
    </div>
  )
}

function TaskItem({ task, companyId }: { task: Task, companyId: string }) {
  // Optimistic UI could be used here, but keeping it simple for now
  return (
    <div className={`flex items-center gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition group ${task.is_completed ? 'opacity-50' : ''}`}>
      <input 
        type="checkbox" 
        checked={task.is_completed}
        onChange={async (e) => {
            await toggleTask(task.id, e.target.checked, companyId)
        }}
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
      <form action={deleteTask} className="opacity-0 group-hover:opacity-100 transition">
         <input type="hidden" name="id" value={task.id} />
         <input type="hidden" name="company_id" value={companyId} />
         <button className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            <X className="w-4 h-4" />
         </button>
      </form>
    </div>
  )
}

