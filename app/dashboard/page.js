'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submission, setSubmission] = useState(null)
  const router = useRouter()

  useEffect(() => {
    async function loadDashboard() {
      // 🔒 FIX 2: Protect route
      const { data: authData, error: authError } = await supabase.auth.getUser()

      if (authError || !authData.user) {
        router.push('/login')
        return
      }

      setUser(authData.user)

      // Check if assessment already submitted
      const { data: submissionData, error: submissionError } =
        await supabase
          .from('submissions')
          .select('*')
          .eq('user_id', authData.user.id)
          .maybeSingle()

      if (submissionError) {
        console.error(submissionError)
      } else {
        setSubmission(submissionData)
      }

      setLoading(false)
    }

    loadDashboard()
  }, [router])

  if (loading) {
    return <p style={{ padding: 20 }}>Loading dashboard...</p>
  }

  return (
    <main style={{ padding: 30 }}>
      <h2>Welcome {user.email}</h2>

      {/* 🔓 FIX 3: Logout button */}
      <button
        onClick={async () => {
          await supabase.auth.signOut()
          router.push('/login')
        }}
        style={{ marginBottom: 20 }}
      >
        Logout
      </button>

      {submission ? (
        <>
          <h3>Assessment Completed ✅</h3>
          <p><strong>Your Score:</strong> {submission.score}</p>

          <button onClick={() => router.push('/profile')}>
            View Profile
          </button>
        </>
      ) : (
        <>
          <p>You have not taken the assessment yet.</p>

          <button onClick={() => router.push('/assessment')}>
            Take Assessment
          </button>
        </>
      )}
    </main>
  )
}
