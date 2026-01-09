'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  async function signup() {
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
      <h2>Sign Up</h2>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button onClick={signup}>Create Account</button>
    </main>
  )
}
