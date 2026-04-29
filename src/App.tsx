import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAtlasStore, useTimeline } from './store'
import { HawkinsMap } from './components/Map'
import { Timeline } from './components/Timeline'
import { InfoCard } from './components/InfoCard'

// ─── IntroAnimation ───────────────────────────────────────────────────────────

function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState<'start' | 'reveal' | 'fade' | 'complete'>('start')

  useEffect(() => {
    const t1 = setTimeout(() => setStage('reveal'), 100)
    const t2 = setTimeout(() => setStage('fade'), 2600)
    const t3 = setTimeout(() => { setStage('complete'); onComplete() }, 3400)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onComplete])

  if (stage === 'complete') return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50"
        initial={{ opacity: 1 }}
        animate={{ opacity: stage === 'fade' ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{ pointerEvents: 'none' }}
      >
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          <defs>
            <mask id="irisMask">
              <rect width="100" height="100" fill="white" />
              <motion.circle cx="50" cy="50" fill="black"
                initial={{ r: 0 }} animate={{ r: stage === 'start' ? 0 : 80 }}
                transition={{ duration: 2.5, ease: 'easeInOut' }} />
            </mask>
            <filter id="blur"><feGaussianBlur in="SourceGraphic" stdDeviation="0.8" /></filter>
          </defs>
          <rect width="100" height="100" fill="#000" mask="url(#irisMask)" filter="url(#blur)" />
        </svg>
        <motion.div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, #1A237E 0%, #4A148C 100%)', mixBlendMode: 'color' }}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: stage === 'fade' ? 0 : 0.6 }}
          transition={{ duration: 0.8 }}
        />
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: stage === 'start' ? 0 : stage === 'reveal' ? 1 : 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1
            className="font-display text-6xl text-white tracking-widest select-none"
            style={{ textShadow: '0 0 30px rgba(74,20,140,0.9), 0 0 60px rgba(26,35,126,0.6)', letterSpacing: '0.3em' }}
          >
            HAWKINS
          </h1>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  const isPlaying = useAtlasStore((s) => s.isPlaying)
  const setPlaying = useAtlasStore((s) => s.setPlaying)
  const selectedEntity = useAtlasStore((s) => s.selectedEntity)
  const clearSelected = useAtlasStore((s) => s.clearSelected)
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
