const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土']

interface Props {
  selectedDay: number | null
  onChange: (day: number | null) => void
}

export function DayFilter({ selectedDay, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <button
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
          selectedDay === null
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        onClick={() => onChange(null)}
      >
        すべて
      </button>
      {DAY_LABELS.map((label, index) => (
        <button
          key={index}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedDay === index
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => onChange(index)}
        >
          {label}曜
        </button>
      ))}
      <button
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
          selectedDay === -1
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        onClick={() => onChange(-1)}
      >
        未定
      </button>
    </div>
  )
}
