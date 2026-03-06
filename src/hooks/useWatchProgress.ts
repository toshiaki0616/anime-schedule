import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { MEMBERS, type Member } from './useWatchList'

// member -> animeId -> episode (0 = 未視聴)
type ProgressMap = Record<Member, Record<number, number>>

function emptyProgress(): ProgressMap {
  return Object.fromEntries(MEMBERS.map((m) => [m, {}])) as ProgressMap
}

export function useWatchProgress() {
  const [progress, setProgressState] = useState<ProgressMap>(emptyProgress)

  useEffect(() => {
    supabase
      .from('watch_progress')
      .select('member, anime_id, episode')
      .then(({ data, error }) => {
        if (error) { console.error('[WatchProgress] 読み込みエラー:', error); return }
        if (!data) return
        const map = emptyProgress()
        data.forEach(({ member, anime_id, episode }: { member: string; anime_id: number; episode: number }) => {
          if (MEMBERS.includes(member as Member)) {
            map[member as Member][anime_id] = episode
          }
        })
        setProgressState(map)
      })
  }, [])

  const setProgress = useCallback((member: Member, animeId: number, episode: number) => {
    setProgressState((prev) => {
      const current = prev[member][animeId] ?? 0
      const next = current === episode ? 0 : episode

      if (next === 0) {
        supabase.from('watch_progress').delete().match({ member, anime_id: animeId })
          .then(({ error }) => { if (error) console.error('[WatchProgress] 削除エラー:', error) })
      } else {
        supabase.from('watch_progress').upsert({ member, anime_id: animeId, episode: next })
          .then(({ error }) => { if (error) console.error('[WatchProgress] 保存エラー:', error) })
      }

      return {
        ...prev,
        [member]: { ...prev[member], [animeId]: next },
      }
    })
  }, [])

  const getProgress = useCallback(
    (member: Member, animeId: number): number => progress[member][animeId] ?? 0,
    [progress]
  )

  return { progress, setProgress, getProgress }
}
