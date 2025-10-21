import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-xl w-full text-center space-y-6">
        <h1 className="text-3xl font-bold">Pharma Portfolio Tracker</h1>
        <p className="text-gray-600">Track your pharma investments across Stocks, Mutual Funds, and ETFs.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded">Log in</Link>
          <Link href="/dashboard" className="px-4 py-2 border rounded">Go to Dashboard</Link>
        </div>
      </div>
    </main>
  )
}
