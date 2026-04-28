import { useEffect, useRef, useState } from 'react'
import { useAtlasStore } from './store/atlasStore'
import { useTimeline } from './hooks/useTimeline'
import { HawkinsMap } from './components/Map/HawkinsMap'
import { Timeline } from './components/Timeline/Timeline'
import { InfoCard } from './components/InfoCard/InfoCard'
import { IntroAnimation } from './components/IntroAnimation/IntroAnimation'

export default function App() {
  const { isPlaying } = useAtlasStore()
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
      <div className="absolute top-6 left-6 pointer-events-none z-10 max-w-sm">
        <div className="flex gap-3">
          <div className="w-0.5 bg-hawkins-amber/60 rounded-full flex-shrink-0" />
          <div>
            <p className="text-[10px] text-hawkins-amber font-mono tracking-[0.2em] uppercase opacity-80">
              {currentMoment?.timeLabel}
            </p>
            <h1
              className="text-2xl font-display text-white mt-1 leading-tight"
              style={{ textShadow: '0 0 20px rgba(245,127,23,0.3), 0 2px 8px rgba(0,0,0,0.8)' }}
            >
              {currentMoment?.title}
            </h1>
            <p className="text-xs text-white/50 mt-1.5 leading-relaxed font-body">
              {currentMoment?.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Timeline scrubber */}
      <Timeline />

      {/* InfoCard overlay */}
      <InfoCard />
    </div>
  )
}
