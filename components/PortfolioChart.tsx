"use client"

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type Slice = { name: string; value: number }

const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#6366f1']

export default function PortfolioChart({ data }: { data: Slice[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  return (
    <div className="w-full h-80 bg-transparent rounded">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie 
            data={data} 
            dataKey="value" 
            nameKey="name" 
            cx="50%" 
            cy="50%" 
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="rgba(15, 23, 42, 0.5)" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
            contentStyle={{ 
              backgroundColor: 'rgba(15, 23, 42, 0.95)', 
              border: '1px solid rgba(71, 85, 105, 0.3)',
              borderRadius: '8px',
              color: '#f3f4f6'
            }}
          />
          <Legend 
            wrapperStyle={{ color: '#f3f4f6' }}
            formatter={(value) => <span style={{ color: '#f3f4f6' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center label */}
      <div className="relative -mt-[240px] flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Total</p>
          <p className="text-lg font-bold text-white">₹{total.toLocaleString('en-IN')}</p>
        </div>
      </div>
    </div>
  )
}

