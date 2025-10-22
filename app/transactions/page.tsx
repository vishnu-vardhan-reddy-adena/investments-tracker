"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { fetchStockMetadata, searchStock, StockMetadata } from '@/lib/stockMetadata'
import { fetchNSEQuote } from '@/lib/nseApi'

type Transaction = {
  id: string
  user_id: string
  investment_id?: string
  transaction_type: 'buy' | 'sell' | 'bonus' | 'split' | 'dividend'
  transaction_date: string
  symbol: string
  stock_name: string
  quantity: number
  price_per_unit: number
  total_amount: number
  split_ratio?: string
  bonus_ratio?: string
  brokerage_fee: number
  stt_charges: number
  other_charges: number
  notes?: string
  created_at: string
}

type Investment = {
  id: string
  category: string
  name: string
  symbol: string | null
  units: number | null
  current_price: number | null
}

export default function TransactionsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [investments, setInvestments] = useState<Investment[]>([])
  const [searchResults, setSearchResults] = useState<Array<{ symbol: string; name: string }>>([])
  const [fetchingMetadata, setFetchingMetadata] = useState(false)
  const [useExistingInvestment, setUseExistingInvestment] = useState(false)
  
  const [form, setForm] = useState<{
    investment_id: string
    investment_category: string
    transaction_type: 'buy' | 'sell' | 'bonus' | 'split' | 'dividend'
    transaction_date: string
    symbol: string
    stock_name: string
    quantity: string
    price_per_unit: string
    total_amount: string
    split_ratio: string
    bonus_ratio: string
    brokerage_fee: string
    stt_charges: string
    other_charges: string
    notes: string
  }>({
    investment_id: '',
    investment_category: '',
    transaction_type: 'buy',
    transaction_date: new Date().toISOString().split('T')[0],
    symbol: '',
    stock_name: '',
    quantity: '',
    price_per_unit: '',
    total_amount: '',
    split_ratio: '',
    bonus_ratio: '',
    brokerage_fee: '',
    stt_charges: '',
    other_charges: '',
    notes: ''
  })

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login')
        return
      }
      setUserId(user.id)
      await Promise.all([
        loadTransactions(user.id),
        loadInvestments(user.id)
      ])
      setLoading(false)
    }
    init()
  }, [router])

  const loadTransactions = async (uid: string) => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', uid)
      .order('transaction_date', { ascending: false })

    if (error) {
      console.error('Error loading transactions:', error)
    } else {
      setTransactions(data as Transaction[])
    }
  }

  const loadInvestments = async (uid: string) => {
    const { data, error } = await supabase
      .from('investments')
      .select('id, category, name, symbol, units, current_price')
      .eq('user_id', uid)
      .in('category', ['Stock', 'Mutual Fund', 'ETF', 'Bond', 'Cryptocurrency', 'Gold', 'NPS'])
      .order('category')
      .order('name')

    if (error) {
      console.error('Error loading investments:', error)
    } else {
      setInvestments(data as Investment[])
    }
  }

  const handleInvestmentSelect = async (investmentId: string) => {
    const investment = investments.find(i => i.id === investmentId)
    if (investment) {
      setForm(f => ({
        ...f,
        investment_id: investment.id,
        investment_category: investment.category,
        symbol: investment.symbol || '',
        stock_name: investment.name,
        price_per_unit: investment.current_price?.toString() || ''
      }))
      setUseExistingInvestment(true)
    }
  }

  const handleSymbolSearch = async (query: string) => {
    setForm(f => ({ ...f, symbol: query }))
    
    if (query.length >= 2) {
      const results = await searchStock(query)
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }

  const handleSymbolSelect = async (symbol: string, name: string) => {
    setForm(f => ({ ...f, symbol, stock_name: name }))
    setSearchResults([])
    setFetchingMetadata(true)
    
    try {
      // Fetch current price
      const quote = await fetchNSEQuote(symbol)
      if (quote && quote.lastPrice > 0) {
        setForm(f => ({ 
          ...f, 
          price_per_unit: quote.lastPrice.toString()
        }))
      }
      
      // Fetch metadata
      const metadata = await fetchStockMetadata(symbol)
      if (metadata) {
        setForm(f => ({ 
          ...f, 
          stock_name: metadata.companyName
        }))
      }
    } catch (error) {
      console.error('Error fetching stock details:', error)
    } finally {
      setFetchingMetadata(false)
    }
  }

  const calculateTotalAmount = () => {
    const qty = parseFloat(form.quantity) || 0
    const price = parseFloat(form.price_per_unit) || 0
    const brokerage = parseFloat(form.brokerage_fee) || 0
    const stt = parseFloat(form.stt_charges) || 0
    const other = parseFloat(form.other_charges) || 0
    
    let total = qty * price
    
    if (form.transaction_type === 'buy') {
      total += brokerage + stt + other
    } else if (form.transaction_type === 'sell') {
      total -= (brokerage + stt + other)
    }
    
    setForm(f => ({ ...f, total_amount: total.toFixed(2) }))
  }

  useEffect(() => {
    if (form.quantity && form.price_per_unit) {
      calculateTotalAmount()
    }
  }, [form.quantity, form.price_per_unit, form.brokerage_fee, form.stt_charges, form.other_charges])

  const addTransaction = async () => {
    if (!userId || !form.symbol || !form.transaction_type) {
      alert('Please fill required fields')
      return
    }

    // Validation based on transaction type
    if (['buy', 'sell'].includes(form.transaction_type) && (!form.quantity || !form.price_per_unit)) {
      alert('Quantity and Price are required for buy/sell transactions')
      return
    }

    if (form.transaction_type === 'split' && !form.split_ratio) {
      alert('Split ratio is required for split transactions')
      return
    }

    if (form.transaction_type === 'bonus' && !form.bonus_ratio) {
      alert('Bonus ratio is required for bonus transactions')
      return
    }

    const payload = {
      user_id: userId,
      investment_id: form.investment_id || null,
      investment_category: form.investment_category || null,
      transaction_type: form.transaction_type,
      transaction_date: form.transaction_date,
      symbol: form.symbol.toUpperCase(),
      stock_name: form.stock_name || form.symbol,
      quantity: form.quantity ? parseFloat(form.quantity) : null,
      price_per_unit: form.price_per_unit ? parseFloat(form.price_per_unit) : null,
      total_amount: form.total_amount ? parseFloat(form.total_amount) : null,
      split_ratio: form.split_ratio || null,
      bonus_ratio: form.bonus_ratio || null,
      brokerage_fee: form.brokerage_fee ? parseFloat(form.brokerage_fee) : 0,
      stt_charges: form.stt_charges ? parseFloat(form.stt_charges) : 0,
      other_charges: form.other_charges ? parseFloat(form.other_charges) : 0,
      notes: form.notes || null
    }

    const { error } = await supabase.from('transactions').insert(payload)

    if (!error) {
      setForm({
        investment_id: '',
        investment_category: '',
        transaction_type: 'buy',
        transaction_date: new Date().toISOString().split('T')[0],
        symbol: '',
        stock_name: '',
        quantity: '',
        price_per_unit: '',
        total_amount: '',
        split_ratio: '',
        bonus_ratio: '',
        brokerage_fee: '',
        stt_charges: '',
        other_charges: '',
        notes: ''
      })
      setUseExistingInvestment(false)
      await loadTransactions(userId)
      alert('Transaction added successfully!')
    } else {
      console.error('Error adding transaction:', error)
      alert('Error adding transaction. Please try again.')
    }
  }

  const deleteTransaction = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return
    
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    
    if (!error && userId) {
      await loadTransactions(userId)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#0f1535] to-[#0a0e27] text-gray-100 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-cyan-400">TRANSACTIONS</h1>
            <p className="text-gray-400 text-sm mt-1">Manage your stock transactions</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm px-4 py-2 rounded bg-gray-700/50 text-gray-300 hover:bg-gray-700 transition-colors border border-gray-600"
            >
              ← Back to Dashboard
            </button>
            <button 
              className="text-sm px-4 py-2 rounded bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors border border-red-600/30"
              onClick={async () => { await supabase.auth.signOut(); router.replace('/login') }}
            >
              Sign out
            </button>
          </div>
        </header>

        {/* Add Transaction Form */}
        <div className="card-dark rounded-lg p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-cyan-400 mb-6">Add New Transaction</h2>
          
          {/* Toggle between existing investment or new stock */}
          <div className="mb-6 flex gap-4">
            <button
              onClick={() => {
                setUseExistingInvestment(false)
                setForm(f => ({ ...f, investment_id: '', symbol: '', stock_name: '', price_per_unit: '' }))
              }}
              className={`px-4 py-2 rounded-lg transition-colors ${
                !useExistingInvestment
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🔍 Search New Stock
            </button>
            <button
              onClick={() => {
                setUseExistingInvestment(true)
                setForm(f => ({ ...f, symbol: '', stock_name: '', price_per_unit: '' }))
              }}
              className={`px-4 py-2 rounded-lg transition-colors ${
                useExistingInvestment
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              📂 Select Existing Investment
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            
            {/* Select Existing Investment */}
            {useExistingInvestment && (
              <div className="md:col-span-2">
                <label htmlFor="investment-select" className="block text-xs text-gray-400 mb-2">Select Investment *</label>
                <select
                  id="investment-select"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  value={form.investment_id}
                  onChange={(e) => handleInvestmentSelect(e.target.value)}
                  required
                >
                  <option value="">-- Select an investment --</option>
                  {Object.entries(
                    investments.reduce((acc, inv) => {
                      if (!acc[inv.category]) acc[inv.category] = []
                      acc[inv.category].push(inv)
                      return acc
                    }, {} as Record<string, Investment[]>)
                  ).map(([category, invs]) => (
                    <optgroup key={category} label={category}>
                      {invs.map((inv) => (
                        <option key={inv.id} value={inv.id}>
                          {inv.name} {inv.symbol ? `(${inv.symbol})` : ''}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            )}
            
            {/* Transaction Type */}
            <div>
              <label htmlFor="transaction-type" className="block text-xs text-gray-400 mb-2">Transaction Type *</label>
              <select
                id="transaction-type"
                aria-label="Transaction Type"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                value={form.transaction_type}
                onChange={e => setForm(f => ({ ...f, transaction_type: e.target.value as any }))}
              >
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
                <option value="bonus">Bonus</option>
                <option value="split">Split</option>
                <option value="dividend">Dividend</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs text-gray-400 mb-2">Transaction Date *</label>
              <input
                placeholder='Enter Transaction Date'
                type="date"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                value={form.transaction_date}
                onChange={e => setForm(f => ({ ...f, transaction_date: e.target.value }))}
              />
            </div>

            {/* Symbol Search - Only show if not using existing investment */}
            {!useExistingInvestment && (
              <div className="relative">
                <label className="block text-xs text-gray-400 mb-2">Symbol / Stock Search *</label>
                <input
                  type="text"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Enter symbol (e.g., TCS, INFY)"
                  value={form.symbol}
                  onChange={e => handleSymbolSearch(e.target.value)}
                />
              
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map((result, idx) => (
                      <button
                        key={idx}
                        className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0"
                        onClick={() => handleSymbolSelect(result.symbol, result.name)}
                      >
                        <div className="font-semibold text-cyan-400">{result.symbol}</div>
                        <div className="text-xs text-gray-400">{result.name}</div>
                      </button>
                    ))}
                  </div>
                )}
                
                {fetchingMetadata && (
                  <div className="absolute right-3 top-10 text-cyan-400 text-xs">
                    Fetching...
                  </div>
                )}
              </div>
            )}

            {/* Stock Name - Show for both modes */}
            {(useExistingInvestment || form.stock_name) && (
              <div>
                <label className="block text-xs text-gray-400 mb-2">Stock/Investment Name</label>
                <input
                  type="text"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white"
                  value={form.stock_name}
                  readOnly
                  placeholder="Stock/Investment Name"
                  title="Stock/Investment Name"
                />
              </div>
            )}
          </div>

          {/* Buy/Sell Fields */}
          {['buy', 'sell'].includes(form.transaction_type) && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-400 mb-2">Quantity *</label>
                <input
                  type="number"
                  step="0.0001"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Enter quantity"
                  aria-label="Quantity"
                  value={form.quantity}
                  onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-2">Price per Unit *</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Enter price"
                  value={form.price_per_unit}
                  onChange={e => setForm(f => ({ ...f, price_per_unit: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-2">Brokerage Fee</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="0.00"
                  value={form.brokerage_fee}
                  onChange={e => setForm(f => ({ ...f, brokerage_fee: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-2">STT Charges</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="0.00"
                  value={form.stt_charges}
                  onChange={e => setForm(f => ({ ...f, stt_charges: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-2">Other Charges</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="0.00"
                  value={form.other_charges}
                  onChange={e => setForm(f => ({ ...f, other_charges: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-2">Total Amount</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Auto-calculated"
                  value={form.total_amount}
                  readOnly
                />
              </div>
            </div>
          )}

          {/* Split Fields */}
          {form.transaction_type === 'split' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-400 mb-2">Split Ratio * (e.g., 1:2, 2:1)</label>
                <input
                  type="text"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="1:2"
                  value={form.split_ratio}
                  onChange={e => setForm(f => ({ ...f, split_ratio: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2">New Quantity</label>
                <input
                  type="number"
                  step="0.0001"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Quantity after split"
                  value={form.quantity}
                  onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* Bonus Fields */}
          {form.transaction_type === 'bonus' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-400 mb-2">Bonus Ratio * (e.g., 1:1, 1:2)</label>
                <input
                  type="text"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="1:1"
                  value={form.bonus_ratio}
                  onChange={e => setForm(f => ({ ...f, bonus_ratio: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2">Bonus Quantity</label>
                <input
                  type="number"
                  step="0.0001"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Bonus shares received"
                  value={form.quantity}
                  onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* Dividend Fields */}
          {form.transaction_type === 'dividend' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-400 mb-2">Dividend Amount</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Total dividend received"
                  value={form.total_amount}
                  onChange={e => setForm(f => ({ ...f, total_amount: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-xs text-gray-400 mb-2">Notes</label>
            <textarea
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Optional notes..."
              rows={2}
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>

          <button
            onClick={addTransaction}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Add Transaction
          </button>
        </div>

        {/* Transaction History */}
        <div className="card-dark rounded-lg p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-cyan-400 mb-4">Transaction History</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">Date</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">Type</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">Symbol</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">Stock Name</th>
                  <th className="text-right py-3 px-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">Quantity</th>
                  <th className="text-right py-3 px-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">Price</th>
                  <th className="text-right py-3 px-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">Amount</th>
                  <th className="text-center py-3 px-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(txn => (
                  <tr key={txn.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 px-2 text-sm text-gray-200">
                      {new Date(txn.transaction_date).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${
                        txn.transaction_type === 'buy' ? 'bg-green-600/20 text-green-400' :
                        txn.transaction_type === 'sell' ? 'bg-red-600/20 text-red-400' :
                        txn.transaction_type === 'bonus' ? 'bg-blue-600/20 text-blue-400' :
                        txn.transaction_type === 'split' ? 'bg-purple-600/20 text-purple-400' :
                        'bg-yellow-600/20 text-yellow-400'
                      }`}>
                        {txn.transaction_type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-sm font-semibold text-cyan-400">{txn.symbol}</td>
                    <td className="py-3 px-2 text-sm text-gray-300">{txn.stock_name}</td>
                    <td className="py-3 px-2 text-sm text-gray-200 text-right">
                      {txn.quantity ? txn.quantity.toLocaleString('en-IN', { maximumFractionDigits: 4 }) : '-'}
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-200 text-right">
                      {txn.price_per_unit ? `₹${txn.price_per_unit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="py-3 px-2 text-sm font-semibold text-gray-200 text-right">
                      {txn.total_amount ? `₹${txn.total_amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => deleteTransaction(txn.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                        title="Delete transaction"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-500">
                      No transactions yet. Add your first transaction above!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
