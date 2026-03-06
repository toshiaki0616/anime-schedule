import { MEMBERS, MEMBER_COLORS, type Member } from '../hooks/useWatchList'

interface Props {
  selected: Member[]
  onChange: (members: Member[]) => void
}

export function MemberSelector({ selected, onChange }: Props) {
  function handleClick(member: Member) {
    if (selected.includes(member)) {
      // 最後の1人は外せない
      if (selected.length === 1) return
      onChange(selected.filter((m) => m !== member))
    } else {
      onChange([...selected, member])
    }
  }

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {MEMBERS.map((member) => (
        <button
          key={member}
          onClick={() => handleClick(member)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors text-white ${
            selected.includes(member)
              ? MEMBER_COLORS[member] + ' ring-2 ring-offset-1 ring-current'
              : MEMBER_COLORS[member] + ' opacity-40 hover:opacity-70'
          }`}
        >
          {member}
        </button>
      ))}
    </div>
  )
}
