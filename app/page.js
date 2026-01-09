'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getUser()

      if (data.user) {
        router.push('/dashboard')
      }
    }

    checkAuth()
  }, [])

  return (
    <main style={{ padding: 40 }}>
      <h1>Developer Assessment Platform</h1>
      <p>Get verified as a backend engineer.</p>

      <br />

      <button onClick={() => router.push('/login')}>
        Login
      </button>

      <button onClick={() => router.push('/signup')} style={{ marginLeft: 10 }}>
        Sign Up
      </button>
    </main>
  )
}
