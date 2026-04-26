import { motion } from 'framer-motion'
import { useAtlasStore } from '../../store/atlasStore'
import { useMomentState } from '../../hooks/useMomentState'

const THEME_COLORS: Record<string, { glow: string; fog: string }> = {
  default: {
    glow: '#FF9800',
    fog: 'rgba(13, 13, 20, 0.3)',
  },
  tense: {
    glow: '#C62828',
    fog: 'rgba(198, 40, 40, 0.15)',
  },
  nightmare: {
    glow: '#4A148C',
    fog: 'rgba(74, 20, 140, 0.2)',
  },
  'upside-down': {
    glow: '#1A237E',
    fog: 'rgba(26, 35, 126, 0.25)',
  },
}

export function ThemeOverlay() {
  const { currentMomentId } = useAtlasStore()
  const resolved = useMomentState(currentMomentId)

  if (!resolved) return null

  const theme = resolved.momentState.visual.theme
  const themeColors = THEME_COLORS[theme] ?? THEME_COLORS.default
  const fogIntensity = resolved.momentState.visual.fog
  const glowColor = resolved.momentState.visual.glow || themeColors.glow

  return (
    <>
      {/* Fog overlay based on moment state */}
      <motion.div
        key={`fog-${currentMomentId}`}
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{
          background: themeColors.fog,
          opacity: fogIntensity,
        }}
      />

      {/* Ambient glow pulse effect */}
      <motion.div
        key={`glow-${currentMomentId}`}
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background: `radial-gradient(circle at 50% 50%, ${glowColor}33 0%, transparent 60%)`,
        }}
      />

      {/* Upside Down theme enhancement */}
      {theme === 'upside-down' && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1 }}
          style={{
            background: 'linear-gradient(135deg, #1A237E 0%, #4A148C 100%)',
            mixBlendMode: 'color',
          }}
        />
      )}

      {/* Nightmare theme particle effect */}
      {theme === 'nightmare' && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ duration: 0.8 }}
          style={{
            backgroundImage: `radial-gradient(circle, rgba(74, 20, 140, 0.3) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      )}
    </>
  )
}
