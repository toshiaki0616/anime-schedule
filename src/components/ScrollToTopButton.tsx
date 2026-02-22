import { useState, useEffect } from 'react'

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-4 z-50 w-10 h-10 rounded-full bg-indigo-600 text-white shadow-lg flex items-center justify-center text-lg hover:bg-indigo-700 transition-colors"
      aria-label="ページトップへ戻る"
    >
      ↑
    </button>
  )
}
