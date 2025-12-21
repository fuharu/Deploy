'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

type StatusData = {
  name: string
  value: number
  color: string
}

export default function StatusChart({ data, total }: { data: StatusData[], total: number }) {
  const chartData = [
    ...data,
    { name: '未達', value: total, color: '#f3f4f6' } // dark mode color should be handled via CSS variable or Context, keeping simple for now
  ]

  return (
    <div className="h-[160px] w-[160px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={70}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
             contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
             itemStyle={{ fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">{total}</span>
          <span className="text-xs text-gray-400">/ {total}</span>
      </div>
    </div>
  )
}

