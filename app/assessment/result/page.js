'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

// Example questions
const questions = [
  { id: 1, answer: 'REST' },
  { id: 2, answer: 'PUT' },
  { id: 3, answer: 'ACID' },
]

export default function Result() {
  const [score, setScore] = useState(null)
  const router = useRouter()

  useEffect(() => {
    async function calculateAndSave() {
      // 1️⃣ Get answers
      const answers = JSON.parse(localStorage.getItem('answers') || '{}')

      // 2️⃣ Calculate score
      let total = 0
      questions.forEach((q) => {
        const userAnswer = (answers[q.id] || '').toLowerCase()
        const correct = q.answer.toLowerCase()
        if (userAnswer.includes(correct.split(' ')[0])) total += 5
        if (userAnswer.includes(correct)) total += 5
      })
      setScore(total)

      // 3️⃣ Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        console.error('No logged-in user', authError)
        alert('You must be logged in to save results')
        router.push('/login')
        return
      }

      // 4️⃣ Save profile to Supabase
      const { error: profileError } = await supabase.from('profiles').upsert(
        {
          user_id: user.id,
          name: user.email.split('@')[0],
          email: user.email,
          score: total,
          assessment_done: true,
          shared_with: [], // ready for company links
        },
        { onConflict: 'user_id' } // prevents duplicates
      )

      if (profileError) {
        console.error('Error saving profile:', profileError)
      } else {
        console.log('Profile saved successfully!')
      }

      // 5️⃣ Save submission (optional)
      await supabase.from('submissions').insert({
        user_id: user.id,
        score: total,
        answers,
      })

      // 6️⃣ Clear answers
      localStorage.removeItem('answers')
    }

    calculateAndSave()
  }, [router])

  if (score === null) return <p style={{ padding: 30 }}>Calculating your score...</p>

  return (
    <main style={{ padding: 30, maxWidth: 600, margin: 'auto' }}>
      <h2>Assessment Complete 🎉</h2>
      <p><strong>Your total score:</strong></p>
      <h1>{score}</h1>

      <button onClick={() => router.push('/dashboard')}>
        Go to Dashboard
      </button>
    </main>
  )
}

