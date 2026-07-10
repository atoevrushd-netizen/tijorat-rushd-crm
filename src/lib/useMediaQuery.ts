import { useEffect, useState } from 'react'

/** Реактивный matchMedia: true, пока запрос совпадает (следит за ресайзом). */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof matchMedia !== 'undefined' ? matchMedia(query).matches : false,
  )
  useEffect(() => {
    if (typeof matchMedia === 'undefined') return
    const mql = matchMedia(query)
    const on = () => setMatches(mql.matches)
    on()
    mql.addEventListener('change', on)
    return () => mql.removeEventListener('change', on)
  }, [query])
  return matches
}
