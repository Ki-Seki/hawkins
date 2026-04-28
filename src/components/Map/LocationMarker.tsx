import { motion } from 'framer-motion'
import type { Location } from '../../types'
import { useAtlasStore } from '../../store/atlasStore'

interface LocationMarkerProps {
  location: Location & { status: string; emphasis: number }
  containerSize: { w: number; h: number }
  isSelected: boolean
}

const STATUS_COLORS: Record<string, string> = {
  active: '#F57F17',
  foreshadowed: '#7A5C20',
  dim: '#3a3a60',
}

export function LocationMarker({ location, containerSize, isSelected }: LocationMarkerProps) {
  const setSelected = useAtlasStore((s) => s.setSelected)

  if (location.status === 'hidden') return null

  // Convert 0–100% JSON coords to actual pixel coords in the SVG
  const cx = (location.map.x / 100) * containerSize.w
  const cy = (location.map.y / 100) * containerSize.h
  const color = isSelected ? '#FF9800' : STATUS_COLORS[location.status] ?? '#3a3a60'

  // Dim: barely visible tiny dot, no animation
  if (location.status === 'dim') {
    return (
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 0.4 }}
        style={{ cursor: 'pointer' }}
        onClick={() => setSelected({ type: 'location', id: location.id })}
      >
        <circle cx={cx} cy={cy} r={2} fill="#3a3a60" />
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
        <circle cx={cx} cy={cy} r={10} fill={color} opacity={0.08} />
        <circle cx={cx} cy={cy} r={4} fill="none" stroke={color} strokeWidth="1" />
        <circle cx={cx} cy={cy} r={1.5} fill={color} />
      </motion.g>
    )
  }

  // Active: pin-dot with pulsing ring and label
  const r = isSelected ? 7 : 6
  const glowRadius = r + 6

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ cursor: 'pointer' }}
      onClick={() => setSelected({ type: 'location', id: location.id })}
    >
      {/* Outer pulse ring — CSS animation for persistent effect */}
      <circle
        cx={cx}
        cy={cy}
        r={r + 8}
        fill="none"
        stroke={color}
        strokeWidth="1"
        className="animate-location-pulse"
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />

      {/* Soft ambient glow */}
      <circle
        cx={cx}
        cy={cy}
        r={glowRadius}
        fill={color}
        opacity={0.10}
        style={{ filter: `blur(${location.emphasis * 4}px)` }}
      />

      {/* Dark backdrop */}
      <circle cx={cx} cy={cy} r={r + 2} fill="#0d0d14" />

      {/* Colored ring */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        style={{ filter: `drop-shadow(0 0 ${location.emphasis * 3}px ${color})` }}
      />

      {/* White center dot */}
      <circle cx={cx} cy={cy} r={2} fill="white" opacity={0.9} />

      {/* Selected extra ring — CSS animation for persistent effect */}
      {isSelected && (
        <circle
          cx={cx}
          cy={cy}
          r={r + 5}
          fill="none"
          stroke="#FF9800"
          strokeWidth="1.5"
          className="animate-selection-ring"
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />
      )}

      {/* Label */}
      <text
        x={cx + (location.map.labelOffset?.x ?? 0) * containerSize.w / 100}
        y={cy + (location.map.labelOffset?.y ?? 0) * containerSize.h / 100 + r + 8}
        textAnchor="middle"
        dominantBaseline="hanging"
        fontSize="11"
        fill={color}
        opacity={0.9}
        fontFamily="'IBM Plex Mono', monospace"
        style={{
          pointerEvents: 'none',
          letterSpacing: '0.08em',
          filter: `drop-shadow(0 0 4px ${color})`,
        }}
      >
        {location.name.toUpperCase()}
      </text>
    </motion.g>
  )
}
