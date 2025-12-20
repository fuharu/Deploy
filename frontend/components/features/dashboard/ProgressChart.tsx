'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ProgressChartProps {
  data: { date: string; count: number }[]
}

export function ProgressChart({ data }: ProgressChartProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border dark:border-gray-700 shadow-sm">
      <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">企業登録数の推移</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280"
            className="dark:text-gray-400"
            tick={{ fill: 'currentColor' }}
          />
          <YAxis 
            stroke="#6b7280"
            className="dark:text-gray-400"
            tick={{ fill: 'currentColor' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
            className="dark:bg-gray-800 dark:border-gray-700"
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="count" 
            stroke="#6366f1" 
            strokeWidth={2}
            name="登録数"
            dot={{ fill: '#6366f1', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

