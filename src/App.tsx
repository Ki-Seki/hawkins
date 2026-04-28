import { useEffect, useRef, useState } from 'react'
import { useAtlasStore } from './store/atlasStore'
import { useTimeline } from './hooks/useTimeline'
import { HawkinsMap } from './components/Map/HawkinsMap'
import { Timeline } from './components/Timeline/Timeline'
import { InfoCard } from './components/InfoCard/InfoCard'
import { IntroAnimation } from './components/IntroAnimation/IntroAnimation'

export default function App() {
  const isPlaying = useAtlasStore((s) => s.isPlaying)
  const { currentMoment, next, hasNext } = useTimeline()
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [showIntro, setShowIntro] = useState(true)

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
      {/* Intro animation */}
      {showIntro && <IntroAnimation onComplete={() => setShowIntro(false)} />}

      {/* Atmospheric overlays from index.css */}
      <div className="vignette pointer-events-none" />
      <div className="grain pointer-events-none" />
      <div className="scanlines pointer-events-none" />

      {/* Main map — height avoids overlap with the h-14 timeline bar */}
      <div className="absolute inset-0 bottom-14">
        <HawkinsMap />
      </div>

      {/* Moment title overlay (top-left) */}
      <div className="absolute top-4 left-4 pointer-events-none z-10 max-w-xs">
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
    </div>
  )
}
