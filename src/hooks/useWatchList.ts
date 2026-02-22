import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const MEMBERS = ['としあき', 'たくろう', 'やすい', 'のうえー', 'はましん'] as const
export type Member = (typeof MEMBERS)[number]

export const MEMBER_COLORS: Record<Member, string> = {
  としあき: 'bg-blue-500',
  たくろう: 'bg-green-500',
  やすい:   'bg-orange-500',
  のうえー: 'bg-pink-500',
  はましん: 'bg-purple-500',
}

type WatchLists = Record<Member, Set<number>>

function emptyLists(): WatchLists {
  return Object.fromEntries(MEMBERS.map((m) => [m, new Set<number>()])) as WatchLists
}

export function useWatchList() {
  const [watchLists, setWatchLists] = useState<WatchLists>(emptyLists)

  // 初回: Supabase から全メンバーのデータを取得
  useEffect(() => {
    supabase
      .from('watch_list')
      .select('member, anime_id')
      .then(({ data, error }) => {
        if (error) { console.error('[WatchList] 読み込みエラー:', error); return }
        if (!data) return
        const lists = emptyLists()
        data.forEach(({ member, anime_id }: { member: string; anime_id: number }) => {
          if (MEMBERS.includes(member as Member)) {
            lists[member as Member].add(anime_id)
          }
        })
        setWatchLists(lists)
      })
  }, [])

  const toggle = useCallback((member: Member, id: number) => {
    setWatchLists((prev) => {
      const next = new Set(prev[member])
      if (next.has(id)) {
        next.delete(id)
        supabase.from('watch_list').delete().match({ member, anime_id: id })
          .then(({ error }) => { if (error) console.error('[WatchList] 削除エラー:', error) })
      } else {
        next.add(id)
        supabase.from('watch_list').insert({ member, anime_id: id })
          .then(({ error }) => { if (error) console.error('[WatchList] 保存エラー:', error) })
      }
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
