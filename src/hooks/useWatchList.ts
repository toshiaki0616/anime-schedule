import { useState, useCallback } from 'react'

const STORAGE_KEY = 'anime-watch-list'

function loadFromStorage(): Set<number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as number[])
  } catch {
    return new Set()
  }
}

function saveToStorage(ids: Set<number>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
}

export function useWatchList() {
  const [watchList, setWatchList] = useState<Set<number>>(loadFromStorage)

  const toggle = useCallback((id: number) => {
    setWatchList((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      saveToStorage(next)
      return next
    })
  }, [])

  const isWatching = useCallback(
    (id: number) => watchList.has(id),
    [watchList]
  )

  return { watchList, toggle, isWatching }
}
