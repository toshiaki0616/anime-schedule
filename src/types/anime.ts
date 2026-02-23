export interface AnimeTitle {
  romaji: string
  native: string | null
}

export interface FuzzyDate {
  year: number | null
  month: number | null
  day: number | null
}

export interface AiringSchedule {
  airingAt: number
  episode: number
}

export interface Studio {
  name: string
}

export interface Anime {
  id: number
  idMal: number | null
  title: AnimeTitle
  coverImage: { extraLarge: string | null; large: string }
  startDate: FuzzyDate
  nextAiringEpisode: AiringSchedule | null
  episodes: number | null
  averageScore: number | null
  popularity: number
  genres: string[]
  studios: { edges: { node: Studio }[] }
  airingDayOfWeek?: number // 0=日 〜 6=土（nextAiringEpisode から計算）
}

export interface AniListResponse {
  data: {
    Page: {
      media: Anime[]
    }
  }
}
