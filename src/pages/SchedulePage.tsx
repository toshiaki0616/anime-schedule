import { useState } from 'react'
import { useAnimeSchedule } from '../hooks/useAnimeSchedule'
import { AnimeCard } from '../components/AnimeCard'
import { DayFilter } from '../components/DayFilter'
import { LoadingSpinner } from '../components/LoadingSpinner'

export function SchedulePage() {
  const { animeList, loading, error } = useAnimeSchedule('WINTER', 2026)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const filtered = selectedDay === null
    ? animeList
    : selectedDay === -1
      ? animeList.filter((a) => a.airingDayOfWeek === undefined)
      : animeList.filter((a) => a.airingDayOfWeek === selectedDay)

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
        {/* 曜日フィルター */}
        {!loading && !error && (
          <div className="mb-6">
            <DayFilter selectedDay={selectedDay} onChange={setSelectedDay} />
            <p className="text-center text-sm text-gray-400 mt-2">
              {filtered.length} 作品
            </p>
          </div>
        )}

        {/* ローディング */}
        {loading && <LoadingSpinner />}

        {/* エラー */}
        {error && (
          <div className="text-center py-16">
            <p className="text-red-500 text-lg mb-2">データの取得に失敗しました</p>
            <p className="text-gray-400 text-sm">{error}</p>
          </div>
        )}

        {/* アニメ一覧グリッド */}
        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
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
