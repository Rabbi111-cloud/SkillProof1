'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AssessmentPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [selectedOption, setSelectedOption] = useState(null)
  const [loading, setLoading] = useState(true)
  const [score, setScore] = useState(null)

  // 1️⃣ Fetch assessments from Supabase
  useEffect(() => {
    async function fetchQuestions() {
      const { data, error } = await supabase
        .from('assessments') // your actual table name
        .select('*')
        .order('id')

      if (error) {
        console.error('Error fetching assessments:', error)
      } else {
        setQuestions(data || [])
      }
      setLoading(false)
    }

    fetchQuestions()
  }, [])

  // 2️⃣ Show loading or empty state
  if (loading) return <p style={{ padding: 30 }}>Loading assessments...</p>
  if (!questions.length) return <p style={{ padding: 30 }}>No assessments available.</p>

  const question = questions[currentIndex]

  // 3️⃣ Track selected option
  function handleSelect(option) {
    setSelectedOption(option)
    setAnswers(prev => ({ ...prev, [currentIndex]: option }))
  }

  // 4️⃣ Next question
  function nextQuestion() {
    if (selectedOption == null) return
    setCurrentIndex(currentIndex + 1)
    setSelectedOption(answers[currentIndex + 1] || null)
  }

  // 5️⃣ Submit assessment
  async function submitAssessment() {
    if (selectedOption == null) return

    const finalAnswers = { ...answers, [currentIndex]: selectedOption }

    // Calculate total score
    let total = 0
    questions.forEach((q, index) => {
      if (finalAnswers[index] === q.correct_option) total += q.points
    })
    setScore(total)

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('You must be logged in to save results')
      router.push('/login')
      return
    }

    // Save to results table
    const { error: resultsError } = await supabase.from('results').insert({
      user_id: user.id,
      answers: finalAnswers,
      score: total,
    })
    if (resultsError) console.error('Error saving results:', resultsError)

    // Upsert profile (RLS safe)
    const { error: profileError } = await supabase.from('profiles').upsert({
      user_id: user.id,
      name: user.email.split('@')[0],
      email: user.email,
      score: total,
      assessment_done: true,
      shared_with: [],
    }, { onConflict: 'user_id' })
    if (profileError) console.error('Error saving profile:', profileError)

    // Clear selections
    setAnswers({})
    setSelectedOption(null)
  }

  // 6️⃣ Show final score
  if (score !== null) {
    return (
      <main style={{ padding: 30, maxWidth: 600, margin: 'auto' }}>
        <h2>Assessment Complete 🎉</h2>
        <p><strong>Your total score:</strong></p>
        <h1>{score}</h1>
        <button
          style={{
            padding: '10px 20px',
            backgroundColor: '#4f46e5',
            color: '#fff',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
          onClick={() => router.push('/dashboard')}
        >
          Go to Dashboard
        </button>
      </main>
    )
  }

  // 7️⃣ Render current question
  return (
    <main style={{ padding: 30, maxWidth: 600, margin: 'auto' }}>
      <p>Question {currentIndex + 1} of {questions.length}</p>
      <h3>{question.question}</h3>

      {['a','b','c','d'].map(optKey => {
        const optionText = question[`option_${optKey}`] || 'Option missing'
        return (
          <div key={optKey} style={{ margin: '10px 0' }}>
            <button
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: selectedOption === optKey.toUpperCase() ? '#4f46e5' : '#e5e7eb',
                color: selectedOption === optKey.toUpperCase() ? '#fff' : '#000',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
              onClick={() => handleSelect(optKey.toUpperCase())}
            >
              {optionText}
            </button>
          </div>
        )
      })}

      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
        {currentIndex > 0 && (
          <button
            style={{
              padding: '10px 20px',
              backgroundColor: '#f3f4f6',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            onClick={() => {
              setCurrentIndex(currentIndex - 1)
              setSelectedOption(answers[currentIndex - 1] || null)
            }}
          >
            Previous
          </button>
        )}

        {currentIndex < questions.length - 1 ? (
          <button
            style={{
              padding: '10px 20px',
              backgroundColor: '#4f46e5',
              color: '#fff',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            onClick={nextQuestion}
            disabled={selectedOption == null}
          >
            Next
          </button>
        ) : (
          <button
            style={{
              padding: '10px 20px',
              backgroundColor: '#10b981',
              color: '#fff',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            onClick={submitAssessment}
            disabled={selectedOption == null}
          >
            Submit Assessment
          </button>
        )}
      </div>
    </main>
  )
}

 
