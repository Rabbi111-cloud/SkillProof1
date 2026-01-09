'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  async function signIn() {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error) router.push('/dashboard')
    else alert(error.message)
  }

  async function signUp() {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (!error) {
      await supabase.from('users').insert({
        id: data.user.id,
        name: email.split('@')[0]
      })
      router.push('/dashboard')
    } else alert(error.message)
  }

  return (
    <main>
      <h1>Developer Assessment</h1>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button onClick={signIn}>Login</button>
      <button onClick={signUp}>Signup</button>
    </main>
  )
}
