'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { questions } from './questions'
import { useRouter } from 'next/navigation'

export default function Assessment() {
  const [answers, setAnswers] = useState({})
  const router = useRouter()

  function calculateScore() {
    let score = 0

    questions.forEach(q => {
      const userAnswer = answers[q.id]?.toLowerCase() || ''
      const correct = q.answer.toLowerCase()

      if (userAnswer.includes(correct.split(' ')[0])) score += 5
      if (userAnswer.includes(correct)) score += 5
    })

    return score
  }

  async function submit() {
    const { data } = await supabase.auth.getUser()
    const score = calculateScore()

    const { error } = await supabase.from('submissions').insert({
      user_id: data.user.id,
      score,
      answers
    })

    if (error) {
      alert(error.message)
      return
    }

    alert(`Assessment submitted. Score: ${score}`)
    router.push('/dashboard')
  }

  return (
    <main style={{ padding: 20 }}>
      <h2>Backend Engineer Assessment</h2>

      {questions.map(q => (
        <div key={q.id}>
          <p>{q.question}</p>
          <input
            onChange={e =>
              setAnswers({ ...answers, [q.id]: e.target.value })
            }
          />
        </div>
      ))}

      <br />
      <button onClick={submit}>Submit</button>
    </main>
  )
}

