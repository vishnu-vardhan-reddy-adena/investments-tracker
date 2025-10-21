"use client"

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import PortfolioChart from '@/components/PortfolioChart'

export type Investment = {
  id: string
  user_id: string
  category: string
  name: string
  symbol?: string
  amount_invested: number
  current_value: number
  units?: number
  purchase_price?: number
  current_price?: number
  date_purchased?: string
  maturity_date?: string
  notes?: string
  institution?: string
  updated_at?: string
  created_at?: string
}

export const INVESTMENT_CATEGORIES = [
  'Stock',
  'Mutual Fund',
  'ETF',
  'EPF',
  'PPF',
  'Fixed Deposit',
  'Bond',
  'Cryptocurrency',
  'Gold',
  'Real Estate',
  'NPS',
  'Savings Account',
  'Recurring Deposit',
  'Other'
] as const

// XIRR Calculation Function
function calculateXIRR(cashflows: {date: Date, amount: number}[]): number {
  if (cashflows.length < 2) return 0
  
  // Simple approximation - for accurate XIRR, use a library
  const totalInvested = cashflows.slice(0, -1).reduce((sum, cf) => sum + Math.abs(cf.amount), 0)
  const currentValue = cashflows[cashflows.length - 1].amount
  const days = (cashflows[cashflows.length - 1].date.getTime() - cashflows[0].date.getTime()) / (1000 * 60 * 60 * 24)
  const years = days / 365
  
  if (years <= 0 || totalInvested <= 0) return 0
  
  const roi = (currentValue - totalInvested) / totalInvested
  const xirr = (Math.pow(1 + roi, 1 / years) - 1) * 100
  
  return isFinite(xirr) ? xirr : 0
}

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [investments, setInvestments] = useState<Investment[]>([])
  const [userName, setUserName] = useState('Portfolio')
  const [showAdvancedFields, setShowAdvancedFields] = useState(false)

  const [form, setForm] = useState({
    category: 'Stock',
    name: '',
    symbol: '',
    amount_invested: '',
    current_value: '',
    units: '',
    purchase_price: '',
    current_price: '',
    date_purchased: '',
    maturity_date: '',
    notes: '',
    institution: ''
  })
  
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [whatIfPercentage, setWhatIfPercentage] = useState<number>(0)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login')
        return
      }
      setUserId(user.id)
      setUserName(user.email?.split('@')[0] || 'User')
      await loadInvestments(user.id)
      setLoading(false)
    }
    init()
  }, [router])

  const loadInvestments = async (uid: string) => {
    const { data, error} = await supabase
      .from('investments')
      .select('*')
      .eq('user_id', uid)
      .order('updated_at', { ascending: false })

    if (error) console.error(error)
    else setInvestments(data as Investment[])
  }

  const addInvestment = async () => {
    if (!userId || !form.name || !form.category) return
    const payload = {
      user_id: userId,
      category: form.category,
      name: form.name,
      symbol: form.symbol || null,
      amount_invested: Number(form.amount_invested || 0),
      current_value: Number(form.current_value || 0),
      units: form.units ? Number(form.units) : null,
      purchase_price: form.purchase_price ? Number(form.purchase_price) : null,
      current_price: form.current_price ? Number(form.current_price) : null,
      date_purchased: form.date_purchased || null,
      maturity_date: form.maturity_date || null,
      notes: form.notes || null,
      institution: form.institution || null,
    }
    const { error } = await supabase.from('investments').insert(payload)
    if (!error) {
      setForm({ 
        category: 'Stock', 
        name: '', 
        symbol: '',
        amount_invested: '', 
        current_value: '', 
        units: '',
        purchase_price: '',
        current_price: '',
        date_purchased: '',
        maturity_date: '',
        notes: '',
        institution: ''
      })
      await loadInvestments(userId)
    } else {
      console.error(error)
    }
  }

  const removeInvestment = async (id: string) => {
    const { error } = await supabase.from('investments').delete().eq('id', id)
    if (!error && userId) await loadInvestments(userId)
  }

  const filtered = useMemo(() => {
    let data = investments
    if (selectedCategory !== 'All') {
      data = data.filter((i: Investment) => i.category === selectedCategory)
    }
    return data
  }, [investments, selectedCategory])
  
  const summary = useMemo(() => {
    const totalInvested = filtered.reduce((sum: number, i: Investment) => sum + (i.amount_invested || 0), 0)
    const totalCurrent = filtered.reduce((sum: number, i: Investment) => sum + (i.current_value || 0), 0)
    const totalGain = totalCurrent - totalInvested
    const roi = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0
    
    // Calculate XIRR (simplified)
    const cashflows = filtered.map(i => ({
      date: i.date_purchased ? new Date(i.date_purchased) : new Date(),
      amount: -(i.amount_invested || 0)
    }))
    cashflows.push({ date: new Date(), amount: totalCurrent })
    const xirr = calculateXIRR(cashflows)
    
    return { totalInvested, totalCurrent, totalGain, roi, xirr }
  }, [filtered])

  // Top 5 and Bottom 5 performers
  const topPerformers = useMemo(() => {
    return [...investments]
      .map(i => ({
        ...i,
        returnPct: i.amount_invested > 0 ? ((i.current_value - i.amount_invested) / i.amount_invested) * 100 : 0
      }))
      .sort((a, b) => b.returnPct - a.returnPct)
      .slice(0, 5)
  }, [investments])

  const bottomPerformers = useMemo(() => {
    return [...investments]
      .map(i => ({
        ...i,
        returnPct: i.amount_invested > 0 ? ((i.current_value - i.amount_invested) / i.amount_invested) * 100 : 0
      }))
      .sort((a, b) => a.returnPct - b.returnPct)
      .slice(0, 5)
  }, [investments])

  const pieData = useMemo(() => {
    const map = new Map<string, number>()
    for (const i of filtered) {
      const key = i.category
      const prev = map.get(key) || 0
      map.set(key, prev + (i.current_value || 0))
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  }, [filtered])

  // What-If calculations
  const whatIfValue = useMemo(() => {
    return summary.totalCurrent * (1 + whatIfPercentage / 100)
  }, [summary.totalCurrent, whatIfPercentage])

  if (loading) return (
    <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center">
      <div className="text-cyan-400 text-xl">Loading...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#0f1535] to-[#0a0e27] text-gray-100 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-cyan-400">MY PORTFOLIO</h1>
            <p className="text-gray-400 text-sm mt-1 capitalize">{userName}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-400">NIFTY 50</p>
              <p className="text-sm font-semibold text-gray-200">--</p>
            </div>
            <button 
              className="text-sm px-4 py-2 rounded bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors border border-red-600/30"
              onClick={async () => { await supabase.auth.signOut(); router.replace('/login') }}
            >
              Sign out
            </button>
          </div>
        </header>

        {/* Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card-dark rounded-lg p-5 shadow-lg">
            <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Investment</p>
            <p className="text-2xl font-bold text-white">₹{summary.totalInvested.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          </div>
          
          <div className="card-dark rounded-lg p-5 shadow-lg">
            <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Current Value</p>
            <p className="text-2xl font-bold text-white">₹{summary.totalCurrent.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          </div>
          
          <div className="card-dark rounded-lg p-5 shadow-lg">
            <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Profit / Loss</p>
            <p className={`text-2xl font-bold ${summary.totalGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {summary.totalGain >= 0 ? '+' : ''}₹{Math.abs(summary.totalGain).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </p>
          </div>
          
          <div className="card-dark rounded-lg p-5 shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">ROI</p>
                <p className={`text-2xl font-bold ${summary.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {summary.roi >= 0 ? '+' : ''}{summary.roi.toFixed(2)}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">XIRR</p>
                <p className={`text-2xl font-bold ${summary.xirr >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {summary.xirr >= 0 ? '+' : ''}{summary.xirr.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Tables */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Top 5 Stocks */}
            <div className="card-dark rounded-lg p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-cyan-400">Stocks - Top 5</h2>
                <p className="text-xs text-gray-400">Date: {new Date().toLocaleDateString('en-GB')}</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">Name</th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">Sector</th>
                      <th className="text-right py-3 px-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">Units</th>
                      <th className="text-right py-3 px-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">Investment</th>
                      <th className="text-right py-3 px-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">Current Value</th>
                      <th className="text-right py-3 px-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">Return %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPerformers.filter(i => i.category === 'Stock').map((inv, idx) => (
                      <tr key={inv.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                        <td className="py-3 px-2 text-sm text-gray-200">{inv.name}</td>
                        <td className="py-3 px-2 text-sm text-gray-400">{inv.institution || 'N/A'}</td>
                        <td className="py-3 px-2 text-sm text-gray-200 text-right">{inv.units || '-'}</td>
                        <td className="py-3 px-2 text-sm text-gray-200 text-right">₹{inv.amount_invested.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        <td className="py-3 px-2 text-sm text-gray-200 text-right">₹{inv.current_value.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        <td className={`py-3 px-2 text-sm font-semibold text-right ${inv.returnPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {inv.returnPct.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                    {topPerformers.filter(i => i.category === 'Stock').length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500 text-sm">No stock investments yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom 5 Stocks */}
            <div className="card-dark rounded-lg p-6 shadow-lg">
              <h2 className="text-lg font-semibold text-red-400 mb-4">Stocks - Bottom 5</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-2 text-xs font-semibold text-red-400 uppercase tracking-wider">Name</th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-red-400 uppercase tracking-wider">Sector</th>
                      <th className="text-right py-3 px-2 text-xs font-semibold text-red-400 uppercase tracking-wider">Units</th>
                      <th className="text-right py-3 px-2 text-xs font-semibold text-red-400 uppercase tracking-wider">Investment</th>
                      <th className="text-right py-3 px-2 text-xs font-semibold text-red-400 uppercase tracking-wider">Current Value</th>
                      <th className="text-right py-3 px-2 text-xs font-semibold text-red-400 uppercase tracking-wider">Return %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bottomPerformers.filter(i => i.category === 'Stock').map((inv, idx) => (
                      <tr key={inv.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                        <td className="py-3 px-2 text-sm text-gray-200">{inv.name}</td>
                        <td className="py-3 px-2 text-sm text-gray-400">{inv.institution || 'N/A'}</td>
                        <td className="py-3 px-2 text-sm text-gray-200 text-right">{inv.units || '-'}</td>
                        <td className="py-3 px-2 text-sm text-gray-200 text-right">₹{inv.amount_invested.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        <td className="py-3 px-2 text-sm text-gray-200 text-right">₹{inv.current_value.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        <td className={`py-3 px-2 text-sm font-semibold text-right ${inv.returnPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {inv.returnPct.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                    {bottomPerformers.filter(i => i.category === 'Stock').length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500 text-sm">No stock investments yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* What If Section */}
            <div className="card-dark rounded-lg p-6 shadow-lg">
              <h2 className="text-lg font-semibold text-purple-400 mb-4">What If (Assets)</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                {[-20, -10, 0, 10, 20].map(pct => (
                  <button
                    key={pct}
                    onClick={() => setWhatIfPercentage(pct)}
                    className={`py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
                      whatIfPercentage === pct
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {pct > 0 ? '+' : ''}{pct}%
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Invested Amount</p>
                  <p className="text-lg font-semibold text-white">₹{summary.totalInvested.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Current Value</p>
                  <p className="text-lg font-semibold text-white">₹{summary.totalCurrent.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">What-If Value</p>
                  <p className="text-lg font-semibold text-purple-400">₹{whatIfValue.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Scenario Impact</p>
                  <p className={`text-lg font-semibold ${whatIfPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {whatIfPercentage > 0 ? '+' : ''}{(whatIfValue - summary.totalCurrent).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Chart & Breakdown */}
          <div className="space-y-6">
            
            {/* Investment Breakdown */}
            <div className="card-dark rounded-lg p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-cyan-400">Investment Breakdown</h2>
                <div className="text-right">
                  <p className="text-xs text-gray-400">USD/INR</p>
                  <p className="text-sm font-semibold text-white">₹87.98</p>
                </div>
              </div>

              <div className="mb-6">
                <PortfolioChart data={pieData} />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-sm text-gray-300">Stocks</span>
                  <span className="text-sm font-semibold text-white">
                    ₹{investments.filter(i => i.category === 'Stock').reduce((sum, i) => sum + i.current_value, 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-sm text-gray-300">ETFs</span>
                  <span className="text-sm font-semibold text-white">
                    ₹{investments.filter(i => i.category === 'ETF').reduce((sum, i) => sum + i.current_value, 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-300">Mutual Funds</span>
                  <span className="text-sm font-semibold text-white">
                    ₹{investments.filter(i => i.category === 'Mutual Fund').reduce((sum, i) => sum + i.current_value, 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 pt-4 border-t border-gray-700">
                  <span className="text-sm font-semibold text-cyan-400">Total Investment</span>
                  <span className="text-lg font-bold text-white">₹{summary.totalInvested.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Investment Form (Collapsible) */}
        <details className="card-dark rounded-lg shadow-lg">
          <summary className="p-6 cursor-pointer hover:bg-gray-800/30 transition-colors rounded-lg">
            <span className="text-lg font-semibold text-cyan-400">➕ Add New Investment</span>
          </summary>
          
          <div className="px-6 pb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select 
                className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" 
                value={form.category} 
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                title="Investment Category"
              >
                {INVESTMENT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              
              <input 
                className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500" 
                placeholder="Name *" 
                value={form.name} 
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                required
              />
              
              <input 
                className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500" 
                placeholder="Symbol/Code (optional)" 
                value={form.symbol} 
                onChange={e => setForm(f => ({ ...f, symbol: e.target.value }))} 
              />
              
              <input 
                className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500" 
                placeholder="Amount Invested *" 
                type="number" 
                step="0.01"
                value={form.amount_invested} 
                onChange={e => setForm(f => ({ ...f, amount_invested: e.target.value }))} 
                required
              />
              
              <input 
                className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500" 
                placeholder="Current Value *" 
                type="number" 
                step="0.01"
                value={form.current_value} 
                onChange={e => setForm(f => ({ ...f, current_value: e.target.value }))} 
                required
              />
              
              <input 
                className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500" 
                placeholder="Units" 
                type="number" 
                step="0.01"
                value={form.units} 
                onChange={e => setForm(f => ({ ...f, units: e.target.value }))} 
              />
            </div>
            
            <button 
              className="w-full md:w-auto bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg px-8 py-3 font-semibold transition-all shadow-lg" 
              onClick={addInvestment}
            >
              Add Investment
            </button>
          </div>
        </details>

        {/* Market Comparison Footer */}
        <div className="card-dark rounded-lg p-4 shadow-lg">
          <div className="flex flex-wrap justify-around items-center gap-4 text-sm">
            <div>
              <span className="text-gray-400">NIFTY 50: </span>
              <span className="text-white font-semibold">ROI: {summary.roi.toFixed(2)}%</span>
              <span className="text-gray-400"> | </span>
              <span className="text-white font-semibold">XIRR: {summary.xirr.toFixed(2)}%</span>
            </div>
            <div>
              <span className="text-gray-400">Portfolio: </span>
              <span className={`font-semibold ${summary.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ROI: {summary.roi.toFixed(2)}%
              </span>
              <span className="text-gray-400"> | </span>
              <span className={`font-semibold ${summary.xirr >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                XIRR: {summary.xirr.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
