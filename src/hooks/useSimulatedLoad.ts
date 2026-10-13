import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

interface UseSimulatedLoadOptions {
  duration?: number
  checkSimulateError?: boolean
}

export function useSimulatedLoad({
  duration = 600,
  checkSimulateError = true,
}: UseSimulatedLoadOptions = {}) {
  const [searchParams] = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
      if (checkSimulateError && searchParams.get('simulateError') === '1') {
        setHasError(true)
      } else {
        setHasError(false)
      }
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, checkSimulateError, searchParams])

  const retry = () => {
    setIsLoading(true)
    setHasError(false)
    setTimeout(() => {
      setIsLoading(false)
      if (checkSimulateError && searchParams.get('simulateError') === '1') {
        setHasError(true)
      }
    }, duration)
  }

  return { isLoading, hasError, retry }
}
