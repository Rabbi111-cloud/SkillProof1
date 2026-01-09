'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard')
    }

    setLoading(false)
  }

  async function handleSignup() {
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      alert('Account created! You can now log in.')
    }

    setLoading(false)
  }

  return (
    <main style={{ padding: 30, maxWidth: 400, margin: 'auto' }}>
      <h2>Login</h2>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', marginBottom: 10 }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', marginBottom: 10 }}
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Login'}
        </button>
      </form>

      <hr style={{ margin: '20px 0' }} />

      <p>New here?</p>

      <button onClick={handleSignup} disabled={loading}>
        {loading ? 'Loading...' : 'Sign Up'}
      </button>

      {error && (
        <p style={{ color: 'red', marginTop: 10 }}>{error}</p>
      )}
    </main>
  )
}
