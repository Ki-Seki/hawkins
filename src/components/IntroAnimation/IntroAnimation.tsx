import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface IntroAnimationProps {
  onComplete: () => void
}

export function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [stage, setStage] = useState<'start' | 'reveal' | 'fade' | 'complete'>('start')

  useEffect(() => {
    // Reveal animation stage (2.5 seconds)
    const revealTimer = setTimeout(() => {
      setStage('reveal')
    }, 100)

    // Fade out stage
    const fadeTimer = setTimeout(() => {
      setStage('fade')
    }, 2600)

    // Complete
    const completeTimer = setTimeout(() => {
      setStage('complete')
      onComplete()
    }, 3400)

    return () => {
      clearTimeout(revealTimer)
      clearTimeout(fadeTimer)
      clearTimeout(completeTimer)
    }
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
        {/* Black background with iris reveal */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <mask id="irisMask">
              <rect width="100" height="100" fill="white" />
              <motion.circle
                cx="50"
                cy="50"
                fill="black"
                initial={{ r: 0 }}
                animate={{ r: stage === 'start' ? 0 : 80 }}
                transition={{ duration: 2.5, ease: 'easeInOut' }}
              />
            </mask>
            <filter id="blur">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" />
            </filter>
          </defs>
          <rect
            width="100"
            height="100"
            fill="#000"
            mask="url(#irisMask)"
            filter="url(#blur)"
          />
        </svg>

        {/* Upside Down blue-purple filter overlay */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #1A237E 0%, #4A148C 100%)',
            mixBlendMode: 'color',
          }}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: stage === 'fade' ? 0 : 0.6 }}
          transition={{ duration: 0.8 }}
        />

        {/* Title overlay */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{
            opacity: stage === 'start' ? 0 : stage === 'reveal' ? 1 : 0,
          }}
          transition={{ duration: 0.8 }}
        >
          <h1
            className="font-display text-6xl text-white tracking-widest select-none"
            style={{
              textShadow: '0 0 30px rgba(74, 20, 140, 0.9), 0 0 60px rgba(26, 35, 126, 0.6)',
              letterSpacing: '0.3em',
            }}
          >
            HAWKINS
          </h1>
        </motion.div>

        {/* Particle effect overlay (optional enhancement) */}
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, transparent 0%, rgba(74, 20, 140, 0.1) 100%)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: stage === 'reveal' ? 0.6 : 0 }}
          transition={{ duration: 1 }}
        />
      </motion.div>
    </AnimatePresence>
  )
}
