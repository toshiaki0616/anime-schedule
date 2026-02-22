import { useState, useEffect } from 'react'
import { SchedulePage } from './pages/SchedulePage'
import { ScrollToTopButton } from './components/ScrollToTopButton'

function App() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  return (
    <>
      <SchedulePage darkMode={darkMode} toggleDarkMode={() => setDarkMode((v) => !v)} />
      <ScrollToTopButton />
    </>
  )
}

export default App
