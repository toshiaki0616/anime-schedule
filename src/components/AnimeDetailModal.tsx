import { useState, useEffect, useCallback } from 'react'
import type { Anime } from '../types/anime'
import { MEMBERS, MEMBER_COLORS } from '../hooks/useWatchList'
import type { useWatchProgress } from '../hooks/useWatchProgress'

interface Episode {
  mal_id: number
  title: string | null
  title_japanese: string | null
}

interface Props {
  anime: Anime
  onClose: () => void
  setProgress: ReturnType<typeof useWatchProgress>['setProgress']
  getProgress: ReturnType<typeof useWatchProgress>['getProgress']
}

async function fetchEpisodes(malId: number): Promise<Episode[]> {
  const key = `episodes_${malId}`
  const cached = sessionStorage.getItem(key)
  if (cached) return JSON.parse(cached) as Episode[]

  const res = await fetch(`https://api.jikan.moe/v4/anime/${malId}/episodes?page=1`)
  const json = await res.json() as { data: Episode[] }
  const episodes = json.data ?? []
  sessionStorage.setItem(key, JSON.stringify(episodes))
  return episodes
}

function buildDummyEpisodes(count: number): Episode[] {
  return Array.from({ length: count }, (_, i) => ({
    mal_id: i + 1,
    title: null,
    title_japanese: null,
  }))
}

export function AnimeDetailModal({ anime, onClose, setProgress, getProgress }: Props) {
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [episodesLoading, setEpisodesLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setEpisodesLoading(true)
      try {
        if (anime.idMal) {
          const data = await fetchEpisodes(anime.idMal)
          if (data.length > 0) {
            setEpisodes(data)
          } else if (anime.episodes) {
            setEpisodes(buildDummyEpisodes(anime.episodes))
          }
        } else if (anime.episodes) {
          setEpisodes(buildDummyEpisodes(anime.episodes))
        }
      } catch {
        if (anime.episodes) setEpisodes(buildDummyEpisodes(anime.episodes))
      } finally {
        setEpisodesLoading(false)
      }
    }
    load()
  }, [anime])

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  const studioName = anime.studios.edges[0]?.node.name ?? null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* ヘッダー */}
        <div className="flex gap-4 p-4 border-b border-gray-100 dark:border-gray-700">
          <img
            src={anime.coverImage.large}
            alt={anime.title.native ?? anime.title.romaji}
            className="w-20 h-28 object-cover rounded-lg flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2">
                  {anime.title.native ?? anime.title.romaji}
                </h2>
                {anime.title.native && (
                  <p className="text-sm text-gray-400 dark:text-gray-500 line-clamp-1">{anime.title.romaji}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="閉じる"
              >
                ×
              </button>
            </div>
            <div className="mt-2 space-y-0.5 text-sm text-gray-600 dark:text-gray-400">
              {studioName && <p>{studioName}</p>}
              {anime.episodes && <p>全 {anime.episodes} 話</p>}
              {anime.averageScore && (
                <p className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span>{anime.averageScore}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* メンバー進捗サマリー */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 font-medium">視聴進捗</p>
          <div className="space-y-1.5">
            {MEMBERS.map((member) => {
              const ep = getProgress(member, anime.id)
              const total = anime.episodes ?? episodes.length
              return (
                <div key={member} className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 rounded-full ${MEMBER_COLORS[member]} flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0`}
                  >
                    {member[0]}
                  </span>
                  <span className="text-xs text-gray-700 dark:text-gray-300 w-16 flex-shrink-0">{member}</span>
                  {ep > 0 ? (
                    <>
                      {total > 0 && (
                        <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${MEMBER_COLORS[member]} rounded-full`}
                            style={{ width: `${Math.min((ep / total) * 100, 100)}%` }}
                          />
                        </div>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                        {ep}{total > 0 ? `/${total}` : ''}話
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-gray-400 dark:text-gray-500">未視聴</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* 話数リスト */}
        <div className="flex-1 overflow-y-auto">
          {episodesLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-gray-400 dark:text-gray-500">話数情報を取得中...</p>
            </div>
          ) : episodes.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-gray-400 dark:text-gray-500">話数情報がありません</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {episodes.map((ep) => {
                const epNum = ep.mal_id
                return (
                  <li key={epNum} className="px-4 py-2.5 flex items-center gap-3">
                    <span className="text-xs text-gray-400 dark:text-gray-500 w-8 flex-shrink-0 text-right">
                      #{epNum}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 dark:text-gray-200 truncate">
                        {ep.title_japanese ?? ep.title ?? `第${epNum}話`}
                      </p>
                      {ep.title && ep.title_japanese && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{ep.title}</p>
                      )}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {MEMBERS.map((member) => {
                        const watched = getProgress(member, anime.id) >= epNum
                        return (
                          <button
                            key={member}
                            onClick={() => setProgress(member, anime.id, epNum)}
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold transition-all ${
                              watched
                                ? `${MEMBER_COLORS[member]} text-white`
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:opacity-70'
                            }`}
                            title={`${member}: ${watched ? '視聴済み' : '未視聴'}`}
                          >
                            {member[0]}
                          </button>
                        )
                      })}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
