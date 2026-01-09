'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

// Example questions (replace with your Supabase questions or local array)
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
      // 1️⃣ Get the answers from localStorage
      const answers = JSON.parse(localStorage.getItem('answers') || '{}')

      // 2️⃣ Calculate total score
      let total = 0
      questions.forEach((q) => {
        const userAnswer = (answers[q.id] || '').toLowerCase()
        const correct = q.answer.toLowerCase()
        if (userAnswer.includes(correct.split(' ')[0])) total += 5
        if (userAnswer.includes(correct)) total += 5
      })

      setScore(total)

      // 3️⃣ Get logged-in user
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        alert('You must be logged in to save results.')
        router.push('/login')
        return
      }

      const userId = data.user.id
      const email = data.user.email

      // 4️⃣ Save submission (optional, you may already have this)
      await supabase.from('submissions').insert({
        user_id: userId,
        score: total,
        answers,
      })

      // 5️⃣ Save developer profile with shared_with ready for Step 2
      const { error: profileError } = await supabase.from('profiles').upsert(
        {
          user_id: userId,
          name: email.split('@')[0], // simple name
          email: email,
          score: total,
          assessment_done: true,
          shared_with: [], // initially empty, can be updated per company later
        },
        { onConflict: 'user_id' } // prevents duplicates
      )

      if (profileError) console.error('Error saving profile:', profileError)

      // 6️⃣ Clean up localStorage
      localStorage.removeItem('answers')
    }

    calculateAndSave()
  }, [router])

  if (score === null) {
    return <p style={{ padding: 30 }}>Calculating your results...</p>
  }

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

