const SEASONS = [
  { key: 'WINTER', label: '冬', months: '1〜3月' },
  { key: 'SPRING', label: '春', months: '4〜6月' },
  { key: 'SUMMER', label: '夏', months: '7〜9月' },
  { key: 'FALL',   label: '秋', months: '10〜12月' },
] as const

export type SeasonKey = (typeof SEASONS)[number]['key']

export const SEASON_INFO = Object.fromEntries(
  SEASONS.map((s) => [s.key, s])
) as Record<SeasonKey, (typeof SEASONS)[number]>

const CURRENT_YEAR = new Date().getFullYear()
const MIN_YEAR = 2020

const YEARS = Array.from(
  { length: CURRENT_YEAR - MIN_YEAR + 1 },
  (_, i) => MIN_YEAR + i
)

interface Props {
  season: SeasonKey
  year: number
  onChange: (season: SeasonKey, year: number) => void
}

export function SeasonSelector({ season, year, onChange }: Props) {
  const btnClass = (active: boolean) =>
    `px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
      active
        ? 'bg-indigo-600 text-white'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`

  return (
    <div className="space-y-2">
      {/* 年タブ */}
      <div className="flex flex-wrap gap-2 justify-center">
        {YEARS.map((y) => (
          <button key={y} className={btnClass(y === year)} onClick={() => onChange(season, y)}>
            {y}年
          </button>
        ))}
      </div>
      {/* シーズンタブ */}
      <div className="flex flex-wrap gap-2 justify-center">
        {SEASONS.map((s) => (
          <button key={s.key} className={btnClass(s.key === season)} onClick={() => onChange(s.key, year)}>
            {s.label}クール
          </button>
        ))}
      </div>
    </div>
  )
}
