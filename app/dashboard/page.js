'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/')
      else setUser(data.user)
    })
  }, [])

  return (
    <main>
      <h2>Welcome {user?.email}</h2>
      <button onClick={() => router.push('/assessment')}>
        Take Assessment
      </button>
    </main>
  )
}
