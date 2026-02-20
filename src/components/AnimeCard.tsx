import type { Anime } from '../types/anime'

const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土']

function formatAiringTime(airingAt: number): string {
  const date = new Date(airingAt * 1000)
  const h = date.getHours().toString().padStart(2, '0')
  const m = date.getMinutes().toString().padStart(2, '0')
  const day = DAY_LABELS[date.getDay()]
  return `${day}曜 ${h}:${m}`
}

function formatStartDate(year: number | null, month: number | null, day: number | null): string {
  if (!year) return '未定'
  if (!month) return `${year}年`
  if (!day) return `${year}年${month}月`
  return `${year}年${month}月${day}日`
}

function formatPopularity(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万人`
  return `${n.toLocaleString()}人`
}

interface Props {
  anime: Anime
  watching: boolean
  onToggleWatch: () => void
}

export function AnimeCard({ anime, watching, onToggleWatch }: Props) {
  const studioName = anime.studios.edges[0]?.node.name ?? null
  const startDate = formatStartDate(
    anime.startDate.year,
    anime.startDate.month,
    anime.startDate.day
  )
  const airingInfo = anime.nextAiringEpisode
    ? `第${anime.nextAiringEpisode.episode}話 / ${formatAiringTime(anime.nextAiringEpisode.airingAt)}`
    : null

  return (
    <div className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${watching ? 'border-indigo-400' : 'border-gray-100'}`}>
      <div className="aspect-[2/3] bg-gray-100 overflow-hidden relative">
        <img
          src={anime.coverImage.extraLarge ?? anime.coverImage.large}
          alt={anime.title.native ?? anime.title.romaji}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* 視聴チェックボタン */}
        <button
          onClick={onToggleWatch}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm shadow transition-colors ${
            watching
              ? 'bg-indigo-600 text-white'
              : 'bg-white/80 text-gray-400 hover:bg-white'
          }`}
          title={watching ? '視聴中' : '視聴リストに追加'}
        >
          {watching ? '✓' : '+'}
        </button>
      </div>
      <div className="p-3">
        <h3 className="font-bold text-sm text-gray-900 line-clamp-2 mb-1">
          {anime.title.native ?? anime.title.romaji}
        </h3>
        {anime.title.native && (
          <p className="text-xs text-gray-400 line-clamp-1 mb-2">{anime.title.romaji}</p>
        )}

        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <span className="text-gray-400">開始</span>
            <span>{startDate}</span>
          </div>

          {airingInfo && (
            <div className="flex items-center gap-1">
              <span className="text-gray-400">次回</span>
              <span className="text-indigo-600 font-medium">{airingInfo}</span>
            </div>
          )}

          {studioName && (
            <div className="flex items-center gap-1">
              <span className="text-gray-400">制作</span>
              <span className="line-clamp-1">{studioName}</span>
            </div>
          )}

          {anime.episodes && (
            <div className="flex items-center gap-1">
              <span className="text-gray-400">全</span>
              <span>{anime.episodes}話</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <span className="text-gray-400">視聴者</span>
            <span>{formatPopularity(anime.popularity)}</span>
          </div>
        </div>

        {anime.averageScore && (
          <div className="mt-2 flex items-center gap-1">
            <span className="text-yellow-500 text-sm">★</span>
            <span className="text-sm font-medium text-gray-700">{anime.averageScore}</span>
          </div>
        )}
      </div>
    </div>
  )
}
