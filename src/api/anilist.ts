import type { AniListResponse } from '../types/anime'

const ANILIST_ENDPOINT = 'https://graphql.anilist.co'

const ANIME_SCHEDULE_QUERY = `
  query ($season: MediaSeason, $seasonYear: Int) {
    Page(page: 1, perPage: 50) {
      media(
        type: ANIME
        season: $season
        seasonYear: $seasonYear
        sort: POPULARITY_DESC
        isAdult: false
      ) {
        id
        title { romaji native }
        coverImage { extraLarge large }
        startDate { year month day }
        nextAiringEpisode { airingAt episode }
        episodes
        averageScore
        popularity
        genres
        studios(isMain: true) {
          edges { node { name } }
        }
      }
    }
  }
`

export async function fetchSeasonalAnime(
  season: string,
  seasonYear: number
): Promise<AniListResponse> {
  const response = await fetch(ANILIST_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: ANIME_SCHEDULE_QUERY,
      variables: { season, seasonYear },
    }),
  })

  if (!response.ok) {
    throw new Error(`AniList API エラー: ${response.status}`)
  }

  return response.json()
}
