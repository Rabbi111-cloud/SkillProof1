'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AssessmentPage() {
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [score, setScore] = useState(null)
  const router = useRouter()

  useEffect(() => {
    fetchQuestions()
  }, [])

  async function fetchQuestions() {
    const { data } = await supabase
      .from('questions')
      .select('*')
      .order('id')

    setQuestions(data || [])
    setLoading(false)
  }

  function handleAnswer(option) {
    setAnswers({
      ...answers,
      [currentIndex]: option,
    })
  }

  function nextQuestion() {
    setCurrentIndex(currentIndex + 1)
  }

  async function submitAssessment() {
    let total = 0

    questions.forEach((q, index) => {
      if (answers[index] === q.correct_option) {
        total += q.points
      }
    })

    setScore(total)

    await supabase.from('results').insert({
      score: total,
      answers,
    })
  }

  if (loading) return <p>Loading...</p>

  if (score !== null) {
    return (
      <main style={{ padding: 30 }}>
        <h2>Assessment Complete 🎉</h2>
        <p>Your total score:</p>
        <h1>{score}</h1>

        <button onClick={() => router.push('/dashboard')}>
          Go to Dashboard
        </button>
      </main>
    )
  }

  const question = questions[currentIndex]

  return (
    <main style={{ padding: 30, maxWidth: 600, margin: 'auto' }}>
      <p>
        Question {currentIndex + 1} of {questions.length}
      </p>

      <h3>{question.question}</h3>

      {['A', 'B', 'C', 'D'].map((opt) => (
        <button
          key={opt}
          onClick={() => handleAnswer(opt)}
          style={{
            display: 'block',
            margin: '10px 0',
            background:
              answers[currentIndex] === opt ? '#ddd' : '#fff',
          }}
        >
          {question[`option_${opt.toLowerCase()}`]}
        </button>
      ))}

      {currentIndex < questions.length - 1 ? (
        <button
          disabled={answers[currentIndex] == null}
          onClick={nextQuestion}
        >
          Next
        </button>
      ) : (
        <button
          disabled={answers[currentIndex] == null}
          onClick={submitAssessment}
        >
          Submit Assessment
        </button>
      )}
    </main>
  )
}
