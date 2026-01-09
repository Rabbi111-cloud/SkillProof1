'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { questions } from '../questions'
import { useRouter } from 'next/navigation'

export default function Result() {
  const [score, setScore] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const answers = JSON.parse(localStorage.getItem('answers') || '{}')
    let total = 0

    questions.forEach(q => {
      const userAnswer = (answers[q.id] || '').toLowerCase()
      const correct = q.answer.toLowerCase()

      if (userAnswer.includes(correct.split(' ')[0])) total += 5
      if (userAnswer.includes(correct)) total += 5
    })

    async function save() {
      const { data } = await supabase.auth.getUser()
      await supabase.from('submissions').insert({
        user_id: data.user.id,
        score: total,
        answers
      })
    }

    save()
    setScore(total)
    localStorage.removeItem('answers')
  }, [])

  return (
    <main>
      <h2>Assessment Complete</h2>
      <p>Your Total Score: {score}</p>
      <button onClick={() => router.push('/dashboard')}>
        Go to Dashboard
      </button>
    </main>
  )
}
