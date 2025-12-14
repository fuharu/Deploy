'use client'

import { useState } from 'react'
import { addTask, toggleTask, deleteTask } from '@/app/companies/[id]/todo_actions'

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
  const [isAdding, setIsAdding] = useState(false)
  
  return (
    <div className="flex flex-col gap-3">
      {initialTasks.map((task) => (
        <TaskItem key={task.id} task={task} companyId={companyId} />
      ))}

      {initialTasks.length === 0 && !isAdding && (
          <div className="text-center py-6 bg-gray-50 rounded border border-dashed border-gray-200 mt-2">
              <div className="text-2xl mb-2">✅</div>
              <p className="text-sm text-gray-500 mb-2">タスクはありません</p>
              <button 
                  onClick={() => setIsAdding(true)} 
                  className="text-blue-600 text-sm font-bold hover:underline"
              >
                  やるべきことを追加する
              </button>
          </div>
      )}

      {isAdding ? (
        <form action={async (formData) => {
            await addTask(formData)
            setIsAdding(false)
        }} className="border p-3 rounded bg-gray-50 flex flex-col gap-2 mt-2">
            <input type="hidden" name="company_id" value={companyId} />
            <input name="title" placeholder="タスク内容" required className="border p-2 rounded w-full text-sm" />
            <input name="due_date" type="date" className="border p-2 rounded w-full text-sm" />
            <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setIsAdding(false)} className="text-xs text-gray-500">キャンセル</button>
                <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded text-xs">追加</button>
            </div>
        </form>
      ) : (
        <button 
            onClick={() => setIsAdding(true)} 
            className="text-blue-500 text-sm hover:underline text-left mt-2"
        >
            + タスクを追加
        </button>
      )}
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
         <button className="text-red-400 hover:text-red-600 px-2">&times;</button>
      </form>
    </div>
  )
}

