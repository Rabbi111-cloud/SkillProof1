'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

const questions = [
  { id: 1, q: 'What is REST?', a: 'Representational State Transfer' }
]

export default function Assessment() {
  const [answers, setAnswers] = useState({})
  const router = useRouter()

  async function submit() {
    const { data } = await supabase.auth.getUser()
    const score =
      answers[1]?.toLowerCase().includes('state') ? 10 : 0

    await supabase.from('submissions').insert({
      user_id: data.user.id,
      score,
      answers
    })

    alert('Submitted')
    router.push('/dashboard')
  }

  return (
    <main>
      <p>{questions[0].q}</p>
      <input onChange={e => setAnswers({ 1: e.target.value })} />
      <button onClick={submit}>Submit</button>
    </main>
  )
}
