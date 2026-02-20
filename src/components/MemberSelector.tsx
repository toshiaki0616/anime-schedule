import { MEMBERS, MEMBER_COLORS, type Member } from '../hooks/useWatchList'

interface Props {
  selected: Member
  onChange: (member: Member) => void
}

export function MemberSelector({ selected, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {MEMBERS.map((member) => (
        <button
          key={member}
          onClick={() => onChange(member)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors text-white ${
            selected === member
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
