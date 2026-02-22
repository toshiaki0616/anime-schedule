import { useState, useMemo } from 'react'
import { useAnimeSchedule } from '../hooks/useAnimeSchedule'
import { useWatchList, MEMBERS, type Member } from '../hooks/useWatchList'
import { useInterestedList } from '../hooks/useInterestedList'
import { AnimeCard } from '../components/AnimeCard'
import { DayFilter } from '../components/DayFilter'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { MemberSelector } from '../components/MemberSelector'
import { SeasonSelector, SEASON_INFO, type SeasonKey } from '../components/SeasonSelector'
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

interface Props {
  darkMode: boolean
  toggleDarkMode: () => void
}

export function SchedulePage({ darkMode, toggleDarkMode }: Props) {
  const [season, setSeason] = useState<SeasonKey>('WINTER')
  const [year, setYear] = useState(2026)
  const { animeList, loading, error } = useAnimeSchedule(season, year)
  const { watchLists, toggle, isWatching, watchingMembers } = useWatchList()
  const { interestedLists, toggle: toggleInterested, isInterested, interestedMembers } = useInterestedList()
  const [selectedMember, setSelectedMember] = useState<Member>(MEMBERS[0])
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('popularity')
  const [watchingOnly, setWatchingOnly] = useState(false)
  const [interestedOnly, setInterestedOnly] = useState(false)

  const seasonInfo = SEASON_INFO[season]

  const currentWatchCount = watchLists[selectedMember].size
  const currentInterestedCount = interestedLists[selectedMember].size

  const filtered = useMemo(() => {
    let list = animeList

    if (watchingOnly) {
      list = list.filter((a) => isWatching(selectedMember, a.id))
    }

    if (interestedOnly) {
      list = list.filter((a) => isInterested(selectedMember, a.id))
    }

    if (selectedDay !== null) {
      list = selectedDay === -1
        ? list.filter((a) => a.airingDayOfWeek === undefined)
        : list.filter((a) => a.airingDayOfWeek === selectedDay)
    }

    return sortAnime(list, sortKey)
  }, [animeList, selectedDay, sortKey, watchingOnly, interestedOnly, selectedMember, isWatching, isInterested])

  const tabBtn = (active: boolean) =>
    `px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
      active
        ? 'bg-indigo-600 text-white'
        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
    }`

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ヘッダー */}
      <header className="bg-indigo-700 text-white py-6 px-4 shadow">
        <div className="max-w-6xl mx-auto flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{year}年 {seasonInfo.label}クール アニメ放映スケジュール</h1>
            <p className="text-indigo-200 text-sm mt-1">
              {seasonInfo.months}放映開始 ・ AniList データ
            </p>
          </div>
          <button
            onClick={toggleDarkMode}
            className="mt-1 w-9 h-9 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-lg transition-colors"
            aria-label="ダークモード切替"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {!loading && !error && (
          <div className="mb-6 space-y-3">
            {/* シーズン選択 */}
            <SeasonSelector
              season={season}
              year={year}
              onChange={(s, y) => { setSeason(s); setYear(y) }}
            />

            {/* メンバー選択 */}
            <div>
              <p className="text-center text-xs text-gray-400 dark:text-gray-500 mb-2">視聴メンバーを選択</p>
              <MemberSelector selected={selectedMember} onChange={setSelectedMember} />
            </div>

            {/* ソートタブ */}
            <div className="flex flex-wrap gap-2 justify-center">
              {SORT_LABELS.map(({ key, label }) => (
                <button
                  key={key}
                  className={tabBtn(sortKey === key)}
                  onClick={() => setSortKey(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* 曜日フィルター */}
            <DayFilter selectedDay={selectedDay} onChange={setSelectedDay} />

            {/* 視聴中・気になるフィルター */}
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                className={tabBtn(watchingOnly)}
                onClick={() => setWatchingOnly((v) => !v)}
              >
                ✓ {selectedMember}の視聴中のみ {currentWatchCount > 0 && `(${currentWatchCount})`}
              </button>
              <button
                className={tabBtn(interestedOnly)}
                onClick={() => setInterestedOnly((v) => !v)}
              >
                ★ {selectedMember}の気になるのみ {currentInterestedCount > 0 && `(${currentInterestedCount})`}
              </button>
            </div>

            <p className="text-center text-sm text-gray-400 dark:text-gray-500">
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
                currentMemberInterested={isInterested(selectedMember, anime.id)}
                interestedMembers={interestedMembers(anime.id)}
                onToggleInterested={() => toggleInterested(selectedMember, anime.id)}
              />
            ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <p className="text-center text-gray-400 dark:text-gray-500 py-16">
            該当するアニメがありません
          </p>
        )}
      </main>
    </div>
  )
}
