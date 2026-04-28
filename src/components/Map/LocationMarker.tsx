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
  dim: '#3A3A50',
  hidden: 'transparent',
}

// Type-specific icon shapes rendered in SVG (relative to cx/cy)
function LocationIcon({ type, cx, cy, r, color }: {
  type: string; cx: number; cy: number; r: number; color: string
}) {
  const s = r * 0.55

  if (type === 'lab') {
    // Hexagon for the lab
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i - Math.PI / 6
      return `${cx + s * Math.cos(a)},${cy + s * Math.sin(a)}`
    }).join(' ')
    return <polygon points={pts} fill={color} stroke={color} strokeWidth="0.3" />
  }

  if (type === 'house') {
    // Small house silhouette
    const hw = s * 0.8
    return (
      <g>
        <rect x={cx - hw * 0.75} y={cy - hw * 0.3} width={hw * 1.5} height={hw * 1.2} fill={color} />
        <polygon points={`${cx},${cy - hw} ${cx - hw},${cy - hw * 0.3} ${cx + hw},${cy - hw * 0.3}`} fill={color} />
      </g>
    )
  }

  if (type === 'school') {
    // Pentagon/star shape
    const pts = Array.from({ length: 5 }, (_, i) => {
      const a = (Math.PI * 2 / 5) * i - Math.PI / 2
      return `${cx + s * Math.cos(a)},${cy + s * Math.sin(a)}`
    }).join(' ')
    return <polygon points={pts} fill={color} />
  }

  if (type === 'woods') {
    // Triangle (tree)
    return (
      <polygon
        points={`${cx},${cy - s * 1.2} ${cx - s},${cy + s * 0.6} ${cx + s},${cy + s * 0.6}`}
        fill={color}
      />
    )
  }

  // Default: circle
  return <circle cx={cx} cy={cy} r={s * 0.9} fill={color} />
}

export function LocationMarker({ location, isSelected }: LocationMarkerProps) {
  const { setSelected } = useAtlasStore()
  const color = isSelected ? '#FF9800' : STATUS_COLORS[location.status] ?? '#3A3A50'
  const glowPx = 1.5 * location.emphasis
  const r = isSelected ? 2.6 : 2.0
  const cx = location.map.x
  const cy = location.map.y

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: location.status === 'dim' ? 0.35 : 1 }}
      transition={{ duration: 0.4 }}
      style={{ cursor: 'pointer' }}
      onClick={() => setSelected({ type: 'location', id: location.id })}
    >
      {/* Outer ambient pulse — only for active/foreshadowed */}
      {location.emphasis > 0.5 && (
        <motion.g
          style={{ transformOrigin: `${cx}px ${cy}px` }}
          animate={{ scale: [1, 1.5, 1], opacity: [location.emphasis * 0.12, 0.02, location.emphasis * 0.12] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <circle cx={cx} cy={cy} r={r + 1.2} fill={color} />
        </motion.g>
      )}

      {/* Glow ring — active only */}
      {location.status === 'active' && (
        <motion.g
          style={{ transformOrigin: `${cx}px ${cy}px` }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.15, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <circle
            cx={cx}
            cy={cy}
            r={r + 1.5}
            fill="none"
            stroke={color}
            strokeWidth="0.4"
            style={{ filter: `drop-shadow(0 0 ${glowPx}px ${color})` }}
          />
        </motion.g>
      )}

      {/* Backdrop (dark circle for contrast) */}
      <circle cx={cx} cy={cy} r={r + 0.5} fill="#0d0d14" opacity={0.7} />

      {/* Type icon */}
      <g style={{ filter: `drop-shadow(0 0 ${glowPx}px ${color})` }}>
        <LocationIcon type={location.type} cx={cx} cy={cy} r={r} color={color} />
      </g>

      {/* Selected ring */}
      {isSelected && (
        <motion.g
          style={{ transformOrigin: `${cx}px ${cy}px` }}
          animate={{ opacity: [0.9, 0.4, 0.9] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <circle cx={cx} cy={cy} r={r + 1.5} fill="none" stroke="#FF9800" strokeWidth="0.8" />
        </motion.g>
      )}

      {/* Label */}
      <text
        x={cx + (location.map.labelOffset?.x ?? 0)}
        y={cy + (location.map.labelOffset?.y ?? r + 2.5)}
        textAnchor="middle"
        dominantBaseline="hanging"
        fontSize="2.2"
        fill={color}
        opacity={location.status === 'dim' ? 0.3 : location.status === 'active' ? 0.9 : 0.55}
        fontFamily="'IBM Plex Mono', monospace"
        style={{
          pointerEvents: 'none',
          letterSpacing: '0.07em',
          filter: location.status === 'active' ? `drop-shadow(0 0 1.5px ${color})` : undefined,
        }}
      >
        {location.name.toUpperCase()}
      </text>
    </motion.g>
  )
}
