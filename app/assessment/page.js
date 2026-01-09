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

  // Fetch questions from Supabase on mount
  useEffect(() => {
    async function fetchQuestions() {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('id')

      if (error) {
        console.error(error)
        return
      }

      setQuestions(data || [])
      setLoading(false)
    }

    fetchQuestions()
  }, [])

  // Handle option selection
  function handleSelect(option) {
    setSelectedOption(option)
    setAnswers(prev => ({ ...prev, [currentIndex]: option }))
  }

  // Go to next question
  function nextQuestion() {
    if (selectedOption == null) return
    setCurrentIndex(currentIndex + 1)
    setSelectedOption(answers[currentIndex + 1] || null)
  }

  // Submit assessment (works with last question)
  async function submitAssessment() {
    if (selectedOption == null) return

    // Ensure last answer is saved
    const finalAnswers = { ...answers, [currentIndex]: selectedOption }

    // Calculate score
    let total = 0
    questions.forEach((q, index) => {
      if (finalAnswers[index] === q.correct_option) {
        total += q.points
      }
    })

    setScore(total)

    // Save results to Supabase
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

    // Upsert profile (works with RLS)
    const { error: profileError } = await supabase.from('profiles').upsert({
      user_id: user.id,
      name: user.email.split('@')[0],
      email: user.email,
      score: total,
      assessment_done: true,
      shared_with: [],
    }, { onConflict: 'user_id' })
    if (profileError) console.error('Error saving profile:', profileError)

    // Clear local state if needed
    setAnswers({})
    setSelectedOption(null)
  }

  if (loading) return <p style={{ padding: 30 }}>Loading questions...</p>

  // Show final score page
  if (score !== null) {
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

  // Current question
  const question = questions[currentIndex]

  return (
    <main style={{ padding: 30, maxWidth: 600, margin: 'auto' }}>
      <p>Question {currentIndex + 1} of {questions.length}</p>
      <h3>{question.question}</h3>

  {['a','b','c','d'].map((optKey) => {
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

