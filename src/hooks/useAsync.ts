import { useCallback, useEffect, useState } from 'react'

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<{ data: T | null; loading: boolean; error: Error | null }>({ data: null, loading: true, error: null })
  const [tick, setTick] = useState(0)
  useEffect(() => {
    let alive = true
    setState((s) => ({ ...s, loading: true, error: null }))
    fn().then(
      (data) => { if (alive) setState({ data, loading: false, error: null }) },
      (error: Error) => { if (alive) setState({ data: null, loading: false, error }) },
    )
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])
  const reload = useCallback(() => setTick((t) => t + 1), [])
  return { ...state, reload }
}
