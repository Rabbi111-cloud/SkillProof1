'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

// Example questions (replace with your real questions or fetch from Supabase)
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
      try {
        // 1️⃣ Get answers from localStorage
        const answers = JSON.parse(localStorage.getItem('answers') || '{}')
        console.log('Answers:', answers)

        // 2️⃣ Calculate total score
        let total = 0
        questions.forEach((q) => {
          const userAnswer = (answers[q.id] || '').toLowerCase()
          const correct = q.answer.toLowerCase()
          if (userAnswer.includes(correct.split(' ')[0])) total += 5
          if (userAnswer.includes(correct)) total += 5
        })
        setScore(total)
        console.log('Calculated Score:', total)

        // 3️⃣ Get current logged-in user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
          console.error('User not logged in', authError)
          alert('You must be logged in to save results.')
          router.push('/login')
          return
        }
        console.log('Logged in user:', user.id, user.email)

        // 4️⃣ Upsert profile safely (works with RLS ON)
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
        const { error: submissionError } = await supabase.from('submissions').insert({
          user_id: user.id,
          score: total,
          answers,
        })

        if (submissionError) console.error('Error saving submission:', submissionError)

        // 6️⃣ Clean up
        localStorage.removeItem('answers')
      } catch (err) {
        console.error('Unexpected error:', err)
      }
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
