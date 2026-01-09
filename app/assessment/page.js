'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AssessmentStart() {
  const router = useRouter()

  useEffect(() => {
    router.push('/assessment/1')
  }, [])

  return null
}
