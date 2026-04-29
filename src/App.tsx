import { useEffect, useRef, useState } from 'react'
import { useAtlasStore } from './store/atlasStore'
import { useTimeline } from './hooks/useTimeline'
import { HawkinsMap } from './components/Map/HawkinsMap'
import { Timeline } from './components/Timeline/Timeline'
import { InfoCard } from './components/InfoCard/InfoCard'
import { IntroAnimation } from './components/IntroAnimation/IntroAnimation'

export default function App() {
  const { isPlaying, setPlaying, selectedEntity, clearSelected } = useAtlasStore()
  const { currentMoment, next, prev, hasNext, hasPrev } = useTimeline()
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [showIntro, setShowIntro] = useState(true)

  // Pause autoplay on user interaction
  useEffect(() => {
    const pauseOnInteraction = () => {
      if (isPlaying) {
        setPlaying(false)
      }
    }

    // Pause when user clicks or uses keyboard to navigate
    window.addEventListener('click', pauseOnInteraction)

    return () => {
      window.removeEventListener('click', pauseOnInteraction)
    }
  }, [isPlaying, setPlaying])

  // Autoplay: advance every 6 seconds when isPlaying
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        if (hasNext) next()
      }, 6000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying, hasNext, next])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          if (hasPrev) prev()
          break
        case 'ArrowRight':
          e.preventDefault()
          if (hasNext) next()
          break
        case 'Escape':
          e.preventDefault()
          if (selectedEntity) {
            clearSelected()
          }
          break
        case ' ':
          e.preventDefault()
          setPlaying(!isPlaying)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hasNext, hasPrev, next, prev, selectedEntity, clearSelected, isPlaying, setPlaying])

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-dim" role="application" aria-label="Hawkins Interactive Map">
      {/* Intro animation */}
      {showIntro && <IntroAnimation onComplete={() => setShowIntro(false)} />}

      {/* Atmospheric overlays from index.css */}
      <div className="vignette pointer-events-none" aria-hidden="true" />
      <div className="grain pointer-events-none" aria-hidden="true" />
      <div className="scanlines pointer-events-none" aria-hidden="true" />

      {/* Main map — height avoids overlap with the h-14 timeline bar */}
      <div className="absolute inset-0 bottom-14" role="main" aria-label="Map view">
        <HawkinsMap />
      </div>

      {/* Moment title overlay (top-left) */}
      <div className="absolute top-4 left-4 pointer-events-none z-10 max-w-xs" role="status" aria-live="polite">
        <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-3">
          <p className="text-hawkins-amber/80 font-mono text-[10px] uppercase tracking-[0.2em] mb-1">
            {currentMoment?.timeLabel}
          </p>
          <h1 className="text-white font-display text-xl leading-tight font-medium">
            {currentMoment?.title}
          </h1>
          <p className="text-white/55 text-xs mt-1.5 leading-relaxed font-sans">
            {currentMoment?.summary}
          </p>
        </div>
      </div>

      {/* Timeline scrubber */}
      <Timeline />

      {/* InfoCard overlay */}
      <InfoCard />

      {/* Keyboard shortcuts hint */}
      <div className="fixed bottom-16 left-4 text-white/30 text-xs font-mono pointer-events-none z-10" aria-hidden="true">
        <p>← → Navigate • Space Play/Pause • Esc Close</p>
      </div>
    </div>
  )
}
