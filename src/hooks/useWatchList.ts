import { useState, useCallback } from 'react'

export const MEMBERS = ['としあき', 'たくろう', 'やすい', 'のうえー', 'はましん'] as const
export type Member = (typeof MEMBERS)[number]

export const MEMBER_COLORS: Record<Member, string> = {
  としあき: 'bg-blue-500',
  たくろう: 'bg-green-500',
  やすい:   'bg-orange-500',
  のうえー: 'bg-pink-500',
  はましん: 'bg-purple-500',
}

const storageKey = (member: Member) => `anime-watch-list-${member}`

function loadAll(): Record<Member, Set<number>> {
  return Object.fromEntries(
    MEMBERS.map((m) => {
      try {
        const raw = localStorage.getItem(storageKey(m))
        return [m, new Set<number>(raw ? (JSON.parse(raw) as number[]) : [])]
      } catch {
        return [m, new Set<number>()]
      }
    })
  ) as Record<Member, Set<number>>
}

function save(member: Member, ids: Set<number>) {
  localStorage.setItem(storageKey(member), JSON.stringify([...ids]))
}

export function useWatchList() {
  const [watchLists, setWatchLists] = useState<Record<Member, Set<number>>>(loadAll)

  const toggle = useCallback((member: Member, id: number) => {
    setWatchLists((prev) => {
      const next = new Set(prev[member])
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      save(member, next)
      return { ...prev, [member]: next }
    })
  }, [])

  const isWatching = useCallback(
    (member: Member, id: number) => watchLists[member].has(id),
    [watchLists]
  )

  const watchingMembers = useCallback(
    (id: number): Member[] => MEMBERS.filter((m) => watchLists[m].has(id)),
    [watchLists]
  )

  return { watchLists, toggle, isWatching, watchingMembers }
}
