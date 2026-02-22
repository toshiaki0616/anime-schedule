import type { Anime } from '../types/anime'
import { MEMBER_COLORS, type Member } from '../hooks/useWatchList'

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
  currentMemberWatching: boolean
  watchingMembers: Member[]
  onToggleWatch: () => void
  currentMemberInterested: boolean
  interestedMembers: Member[]
  onToggleInterested: () => void
}

export function AnimeCard({ anime, currentMemberWatching, watchingMembers, onToggleWatch, currentMemberInterested, interestedMembers, onToggleInterested }: Props) {
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
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${currentMemberWatching ? 'border-indigo-400' : 'border-gray-100 dark:border-gray-700'}`}>
      <div className="aspect-[2/3] bg-gray-100 dark:bg-gray-700 overflow-hidden relative">
        <img
          src={anime.coverImage.extraLarge ?? anime.coverImage.large}
          alt={anime.title.native ?? anime.title.romaji}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* ★ 気になるボタン（左上） */}
        <button
          onClick={onToggleInterested}
          className={`absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center text-sm shadow transition-colors ${
            currentMemberInterested
              ? 'bg-yellow-400 text-white'
              : 'bg-white/80 text-gray-400 hover:bg-white'
          }`}
          title={currentMemberInterested ? '気になる済み' : '気になる'}
        >
          ★
        </button>

        {/* 視聴チェックボタン（右上） */}
        <button
          onClick={onToggleWatch}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm shadow transition-colors ${
            currentMemberWatching
              ? 'bg-indigo-600 text-white'
              : 'bg-white/80 text-gray-400 hover:bg-white'
          }`}
          title={currentMemberWatching ? '視聴中' : '視聴リストに追加'}
        >
          {currentMemberWatching ? '✓' : '+'}
        </button>

        {/* 気になるメンバーのドット（左下）*/}
        {interestedMembers.length > 0 && (
          <div className="absolute bottom-2 left-2 flex gap-1">
            {interestedMembers.map((m) => (
              <span
                key={m}
                className={`w-4 h-4 rounded-full ${MEMBER_COLORS[m]} flex items-center justify-center text-white text-[8px] font-bold ring-1 ring-yellow-400`}
                title={`${m}（気になる）`}
              >
                {m[0]}
              </span>
            ))}
          </div>
        )}

        {/* 視聴中メンバーのドット（右下）*/}
        {watchingMembers.length > 0 && (
          <div className="absolute bottom-2 right-2 flex gap-1">
            {watchingMembers.map((m) => (
              <span
                key={m}
                className={`w-4 h-4 rounded-full ${MEMBER_COLORS[m]} flex items-center justify-center text-white text-[8px] font-bold`}
                title={`${m}（視聴中）`}
              >
                {m[0]}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 mb-1">
          {anime.title.native ?? anime.title.romaji}
        </h3>
        {anime.title.native && (
          <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-1 mb-2">{anime.title.romaji}</p>
        )}

        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <span className="text-gray-400 dark:text-gray-500">開始</span>
            <span>{startDate}</span>
          </div>

          {airingInfo && (
            <div className="flex items-center gap-1">
              <span className="text-gray-400 dark:text-gray-500">次回</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-medium">{airingInfo}</span>
            </div>
          )}

          {studioName && (
            <div className="flex items-center gap-1">
              <span className="text-gray-400 dark:text-gray-500">制作</span>
              <span className="line-clamp-1">{studioName}</span>
            </div>
          )}

          {anime.episodes && (
            <div className="flex items-center gap-1">
              <span className="text-gray-400 dark:text-gray-500">全</span>
              <span>{anime.episodes}話</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <span className="text-gray-400 dark:text-gray-500">視聴者</span>
            <span>{formatPopularity(anime.popularity)}</span>
          </div>
        </div>

        {anime.averageScore && (
          <div className="mt-2 flex items-center gap-1">
            <span className="text-yellow-500 text-sm">★</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{anime.averageScore}</span>
          </div>
        )}
      </div>
    </div>
  )
}
