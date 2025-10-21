import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pharma Portfolio Tracker',
  description: 'Track pharma investments across stocks, mutual funds, and ETFs',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}
