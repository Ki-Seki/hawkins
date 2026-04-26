import { motion } from 'framer-motion'
import type { Location } from '../../types'
import { useAtlasStore } from '../../store/atlasStore'

interface LocationMarkerProps {
  location: Location & { status: string; emphasis: number }
  isSelected: boolean
}

const STATUS_COLORS: Record<string, string> = {
  active: '#F57F17',
  foreshadowed: '#5C4A1A',
  dim: '#2A2A3A',
  hidden: 'transparent',
}

export function LocationMarker({ location, isSelected }: LocationMarkerProps) {
  const { setSelected } = useAtlasStore()
  const color = isSelected ? '#FF9800' : STATUS_COLORS[location.status] ?? '#2A2A3A'
  const glowSize = 8 * location.emphasis
  const radius = isSelected ? 9 : 7

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: location.status === 'dim' ? 0.4 : 1 }}
      transition={{ duration: 0.4 }}
      style={{ cursor: 'pointer' }}
      onClick={() => setSelected({ type: 'location', id: location.id })}
    >
      {/* Glow ring */}
      {location.emphasis > 0.3 && (
        <motion.circle
          cx={location.map.x}
          cy={location.map.y}
          r={radius + 6}
          fill="none"
          stroke={color}
          strokeWidth="1"
          opacity={location.emphasis * 0.5}
          animate={{ r: [radius + 4, radius + 10, radius + 4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ filter: `drop-shadow(0 0 ${glowSize}px ${color})` }}
        />
      )}

      {/* Main dot */}
      <circle
        cx={location.map.x}
        cy={location.map.y}
        r={radius}
        fill={color}
        style={{ filter: `drop-shadow(0 0 ${glowSize}px ${color})` }}
      />

      {/* Selected ring */}
      {isSelected && (
        <circle
          cx={location.map.x}
          cy={location.map.y}
          r={radius + 4}
          fill="none"
          stroke="#FF9800"
          strokeWidth="1.5"
          opacity="0.8"
        />
      )}

      {/* Label */}
      <text
        x={location.map.x + (location.map.labelOffset?.x ?? 0)}
        y={location.map.y + (location.map.labelOffset?.y ?? radius + 5)}
        textAnchor="middle"
        dominantBaseline="hanging"
        fontSize="2.2"
        fill="white"
        opacity={location.status === 'dim' ? 0.3 : 0.75}
        fontFamily="'IBM Plex Mono', monospace"
        style={{ pointerEvents: 'none', letterSpacing: '0.05em' }}
      >
        {location.name}
      </text>
    </motion.g>
  )
}
