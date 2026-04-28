import { motion } from 'framer-motion'
import type { Location } from '../../types'
import { useAtlasStore } from '../../store/atlasStore'

interface LocationMarkerProps {
  location: Location & { status: string; emphasis: number }
  isSelected: boolean
}

const STATUS_COLORS: Record<string, string> = {
  active: '#F57F17',
  foreshadowed: '#7A5C20',
  dim: '#3a3a60',
}

export function LocationMarker({ location, isSelected }: LocationMarkerProps) {
  const { setSelected } = useAtlasStore()

  if (location.status === 'hidden') return null

  const cx = location.map.x
  const cy = location.map.y
  const color = isSelected ? '#FF9800' : STATUS_COLORS[location.status] ?? '#3a3a60'

  // Dim: barely visible tiny dot, no animation, no glow
  if (location.status === 'dim') {
    return (
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 0.4 }}
        style={{ cursor: 'pointer' }}
        onClick={() => setSelected({ type: 'location', id: location.id })}
      >
        <circle cx={cx} cy={cy} r={0.5} fill="#3a3a60" />
      </motion.g>
    )
  }

  // Foreshadowed: small dim dot with static glow, no label
  if (location.status === 'foreshadowed') {
    return (
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 0.4 }}
        style={{ cursor: 'pointer' }}
        onClick={() => setSelected({ type: 'location', id: location.id })}
      >
        <circle cx={cx} cy={cy} r={2.5} fill={color} opacity={0.08} />
        <circle cx={cx} cy={cy} r={1.0} fill="none" stroke={color} strokeWidth="0.4" />
        <circle cx={cx} cy={cy} r={0.35} fill={color} />
      </motion.g>
    )
  }

  // Active: full pin-dot with pulsing ring, glow, and label
  const r = isSelected ? 1.8 : 1.5
  const glowPx = 1.5 * location.emphasis

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ cursor: 'pointer' }}
      onClick={() => setSelected({ type: 'location', id: location.id })}
    >
      {/* Outer pulse ring */}
      <motion.circle
        cx={cx}
        cy={cy}
        r={r + 2}
        fill="none"
        stroke={color}
        strokeWidth="0.3"
        style={{ transformOrigin: `${cx}px ${cy}px` }}
        animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Soft ambient glow */}
      <circle
        cx={cx}
        cy={cy}
        r={r + 1.5}
        fill={color}
        opacity={0.12}
        style={{ filter: `drop-shadow(0 0 ${glowPx}px ${color})` }}
      />

      {/* Dark backdrop for contrast */}
      <circle cx={cx} cy={cy} r={r + 0.4} fill="#0d0d14" />

      {/* Colored ring */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="0.5"
        style={{ filter: `drop-shadow(0 0 ${glowPx}px ${color})` }}
      />

      {/* White center dot — pin look */}
      <circle cx={cx} cy={cy} r={0.5} fill="white" opacity={0.9} />

      {/* Selected extra ring */}
      {isSelected && (
        <motion.circle
          cx={cx}
          cy={cy}
          r={r + 1.5}
          fill="none"
          stroke="#FF9800"
          strokeWidth="0.6"
          style={{ transformOrigin: `${cx}px ${cy}px` }}
          animate={{ opacity: [0.9, 0.4, 0.9] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      {/* Label */}
      <text
        x={cx + (location.map.labelOffset?.x ?? 0)}
        y={cy + (location.map.labelOffset?.y ?? r + 2)}
        textAnchor="middle"
        dominantBaseline="hanging"
        fontSize="1.8"
        fill={color}
        opacity={0.9}
        fontFamily="'IBM Plex Mono', monospace"
        style={{
          pointerEvents: 'none',
          letterSpacing: '0.05em',
          filter: `drop-shadow(0 0 1.5px ${color})`,
        }}
      >
        {location.name.toUpperCase()}
      </text>
    </motion.g>
  )
}
