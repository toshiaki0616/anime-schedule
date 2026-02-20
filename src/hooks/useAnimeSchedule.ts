import { useEffect, useState } from 'react'
import { fetchSeasonalAnime } from '../api/anilist'
import type { Anime } from '../types/anime'

function calcDayOfWeek(anime: Anime): number | undefined {
  if (!anime.nextAiringEpisode) return undefined
  const date = new Date(anime.nextAiringEpisode.airingAt * 1000)
  return date.getDay() // 0=日, 1=月, ..., 6=土
}

export function useAnimeSchedule(season: string, seasonYear: number) {
  const [animeList, setAnimeList] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    fetchSeasonalAnime(season, seasonYear)
      .then((res) => {
        const list = res.data.Page.media.map((anime) => ({
          ...anime,
          airingDayOfWeek: calcDayOfWeek(anime),
        }))
        setAnimeList(list)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'データの取得に失敗しました')
      })
      .finally(() => setLoading(false))
  }, [season, seasonYear])

  return { animeList, loading, error }
}
