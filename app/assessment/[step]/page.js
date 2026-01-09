'use client'

import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { questions } from '../questions'

export default function QuestionPage() {
  const { step } = useParams()
  const index = Number(step) - 1
  const question = questions[index]
  const router = useRouter()
  const [answer, setAnswer] = useState('')

  if (!question) return <p>Invalid question</p>

  function next() {
    const stored = JSON.parse(localStorage.getItem('answers') || '{}')
    stored[question.id] = answer
    localStorage.setItem('answers', JSON.stringify(stored))

    if (index + 1 < questions.length) {
      router.push(`/assessment/${index + 2}`)
    } else {
      router.push('/assessment/result')
    }
  }

  return (
    <main>
      <h3>Question {question.id}</h3>
      <p>{question.question}</p>
      <input onChange={e => setAnswer(e.target.value)} />
      <button onClick={next}>Submit & Next</button>
    </main>
  )
}
