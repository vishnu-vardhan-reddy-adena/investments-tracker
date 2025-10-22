"use client"

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { getSectorColor } from '@/lib/stockMetadata'

type AnalysisData = { 
  name: string
  value: number
  count?: number
  returnPct?: number
}

interface AnalysisChartProps {
  data: AnalysisData[]
  title: string
  type?: 'donut' | 'bar'
  valueFormatter?: (value: number) => string
}

export default function AnalysisChart({ data, title, type = 'donut', valueFormatter }: AnalysisChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  const formatValue = valueFormatter || ((value: number) => `₹${value.toLocaleString('en-IN')}`)
  
  if (type === 'bar') {
    return (
      <div className="w-full h-80 bg-transparent rounded">
        <h3 className="text-sm font-semibold text-gray-300 mb-4 text-center">{title}</h3>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(71, 85, 105, 0.3)" />
            <XAxis 
              dataKey="name" 
              stroke="#9ca3af" 
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <Tooltip 
              formatter={(value: number) => formatValue(value)}
              contentStyle={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                border: '1px solid rgba(71, 85, 105, 0.3)',
                borderRadius: '8px',
                color: '#f3f4f6'
              }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getSectorColor(entry.name)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }
  
  return (
    <div className="w-full h-80 bg-transparent rounded">
      <h3 className="text-sm font-semibold text-gray-300 mb-2 text-center">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie 
            data={data} 
            dataKey="value" 
            nameKey="name" 
            cx="50%" 
            cy="50%" 
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
          >
            {data.map((entry, i) => (
              <Cell 
                key={i} 
                fill={getSectorColor(entry.name)} 
                stroke="rgba(15, 23, 42, 0.5)" 
                strokeWidth={2} 
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => formatValue(value)}
            contentStyle={{ 
              backgroundColor: 'rgba(15, 23, 42, 0.95)', 
              border: '1px solid rgba(71, 85, 105, 0.3)',
              borderRadius: '8px',
              color: '#f3f4f6'
            }}
          />
          <Legend 
            wrapperStyle={{ color: '#f3f4f6', fontSize: '12px' }}
            formatter={(value) => <span className="text-gray-300 text-xs">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center label */}
      <div className="relative -mt-[240px] flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Total</p>
          <p className="text-base font-bold text-white">{formatValue(total)}</p>
        </div>
      </div>
    </div>
  )
}
