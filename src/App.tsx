import { useEffect, useRef } from 'react'
import { useAtlasStore } from './store/atlasStore'
import { useTimeline } from './hooks/useTimeline'
import { HawkinsMap } from './components/Map/HawkinsMap'
import { Timeline } from './components/Timeline/Timeline'
import { InfoCard } from './components/InfoCard/InfoCard'

export default function App() {
  const { isPlaying } = useAtlasStore()
  const { currentMoment, next, hasNext } = useTimeline()
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

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

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-dim">
      {/* Atmospheric overlays from index.css */}
      <div className="vignette pointer-events-none" />
      <div className="grain pointer-events-none" />

      {/* Main map */}
      <HawkinsMap />

      {/* Moment title overlay (top-left) */}
      <div className="absolute top-6 left-6 pointer-events-none z-10">
        <p className="text-xs text-hawkins-amber font-mono tracking-widest uppercase opacity-70">
          {currentMoment?.timeLabel}
        </p>
        <h1 className="text-2xl font-display text-white mt-1 drop-shadow-lg">
          {currentMoment?.title}
        </h1>
        <p className="text-sm text-white/60 mt-1 max-w-xs leading-relaxed">
          {currentMoment?.summary}
        </p>
      </div>

      {/* Timeline scrubber */}
      <Timeline />

      {/* InfoCard overlay */}
      <InfoCard />
    </div>
  )
}
