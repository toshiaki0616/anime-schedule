import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { MEMBERS, type Member } from './useWatchList'

type InterestedLists = Record<Member, Set<number>>

function emptyLists(): InterestedLists {
  return Object.fromEntries(MEMBERS.map((m) => [m, new Set<number>()])) as InterestedLists
}

export function useInterestedList() {
  const [interestedLists, setInterestedLists] = useState<InterestedLists>(emptyLists)

  useEffect(() => {
    supabase
      .from('interested_list')
      .select('member, anime_id')
      .then(({ data, error }) => {
        if (error) { console.error('[InterestedList] 読み込みエラー:', error); return }
        if (!data) return
        const lists = emptyLists()
        data.forEach(({ member, anime_id }: { member: string; anime_id: number }) => {
          if (MEMBERS.includes(member as Member)) {
            lists[member as Member].add(anime_id)
          }
        })
        setInterestedLists(lists)
      })
  }, [])

  const toggle = useCallback((member: Member, id: number) => {
    setInterestedLists((prev) => {
      const next = new Set(prev[member])
      if (next.has(id)) {
        next.delete(id)
        supabase.from('interested_list').delete().match({ member, anime_id: id })
          .then(({ error }) => { if (error) console.error('[InterestedList] 削除エラー:', error) })
      } else {
        next.add(id)
        supabase.from('interested_list').insert({ member, anime_id: id })
          .then(({ error }) => { if (error) console.error('[InterestedList] 保存エラー:', error) })
      }
      return { ...prev, [member]: next }
    })
  }, [])

  const isInterested = useCallback(
    (member: Member, id: number) => interestedLists[member].has(id),
    [interestedLists]
  )

  const interestedMembers = useCallback(
    (id: number): Member[] => MEMBERS.filter((m) => interestedLists[m].has(id)),
    [interestedLists]
  )

  return { interestedLists, toggle, isInterested, interestedMembers }
}
