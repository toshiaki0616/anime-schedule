import { useState, useMemo } from 'react'
import { useAnimeSchedule } from '../hooks/useAnimeSchedule'
import { useWatchList, MEMBERS, type Member } from '../hooks/useWatchList'
import { AnimeCard } from '../components/AnimeCard'
import { DayFilter } from '../components/DayFilter'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { MemberSelector } from '../components/MemberSelector'
import type { Anime } from '../types/anime'

type SortKey = 'popularity' | 'score' | 'startDate'

const SORT_LABELS: { key: SortKey; label: string }[] = [
  { key: 'popularity', label: '視聴者数順' },
  { key: 'score', label: 'スコア順' },
  { key: 'startDate', label: '放映日順' },
]

function sortAnime(list: Anime[], key: SortKey): Anime[] {
  return [...list].sort((a, b) => {
    if (key === 'popularity') return b.popularity - a.popularity
    if (key === 'score') return (b.averageScore ?? 0) - (a.averageScore ?? 0)
    if (key === 'startDate') {
      const da = a.startDate
      const db = b.startDate
      const ta = new Date(da.year ?? 0, (da.month ?? 1) - 1, da.day ?? 1).getTime()
      const tb = new Date(db.year ?? 0, (db.month ?? 1) - 1, db.day ?? 1).getTime()
      return ta - tb
    }
    return 0
  })
}

export function SchedulePage() {
  const { animeList, loading, error } = useAnimeSchedule('WINTER', 2026)
  const { watchLists, toggle, isWatching, watchingMembers } = useWatchList()
  const [selectedMember, setSelectedMember] = useState<Member>(MEMBERS[0])
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('popularity')
  const [watchingOnly, setWatchingOnly] = useState(false)

  const currentWatchCount = watchLists[selectedMember].size

  const filtered = useMemo(() => {
    let list = animeList

    if (watchingOnly) {
      list = list.filter((a) => isWatching(selectedMember, a.id))
    }

    if (selectedDay !== null) {
      list = selectedDay === -1
        ? list.filter((a) => a.airingDayOfWeek === undefined)
        : list.filter((a) => a.airingDayOfWeek === selectedDay)
    }

    return sortAnime(list, sortKey)
  }, [animeList, selectedDay, sortKey, watchingOnly, selectedMember, isWatching])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-indigo-700 text-white py-6 px-4 shadow">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold">2026年 冬クール アニメ放映スケジュール</h1>
          <p className="text-indigo-200 text-sm mt-1">
            1〜3月放映開始 ・ AniList データ
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {!loading && !error && (
          <div className="mb-6 space-y-3">
            {/* メンバー選択 */}
            <div>
              <p className="text-center text-xs text-gray-400 mb-2">視聴メンバーを選択</p>
              <MemberSelector selected={selectedMember} onChange={setSelectedMember} />
            </div>

            {/* ソートタブ */}
            <div className="flex flex-wrap gap-2 justify-center">
              {SORT_LABELS.map(({ key, label }) => (
                <button
                  key={key}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    sortKey === key
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => setSortKey(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* 曜日フィルター */}
            <DayFilter selectedDay={selectedDay} onChange={setSelectedDay} />

            {/* 視聴中フィルター */}
            <div className="flex justify-center">
              <button
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  watchingOnly
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setWatchingOnly((v) => !v)}
              >
                ✓ {selectedMember}の視聴中のみ表示 {currentWatchCount > 0 && `(${currentWatchCount})`}
              </button>
            </div>

            <p className="text-center text-sm text-gray-400">
              {filtered.length} 作品
            </p>
          </div>
        )}

        {loading && <LoadingSpinner />}

        {error && (
          <div className="text-center py-16">
            <p className="text-red-500 text-lg mb-2">データの取得に失敗しました</p>
            <p className="text-gray-400 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map((anime) => (
              <AnimeCard
                key={anime.id}
                anime={anime}
                currentMemberWatching={isWatching(selectedMember, anime.id)}
                watchingMembers={watchingMembers(anime.id)}
                onToggleWatch={() => toggle(selectedMember, anime.id)}
              />
            ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <p className="text-center text-gray-400 py-16">
            該当するアニメがありません
          </p>
        )}
      </main>
    </div>
  )
}
