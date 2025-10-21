"use client"

import { supabase } from '@/lib/supabaseClient'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') router.replace('/dashboard')
    })
    return () => subscription.unsubscribe()
  }, [router])

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
        <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} providers={["google"]} />
      </div>
    </main>
  )
}
