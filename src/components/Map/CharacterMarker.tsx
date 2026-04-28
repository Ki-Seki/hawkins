import { motion } from 'framer-motion'
import type { Character } from '../../types'
import { useAtlasStore } from '../../store/atlasStore'

interface CharacterMarkerProps {
  character: Character & { locationId: string; status: string }
  locationX: number
  locationY: number
  containerSize: { w: number; h: number }
  index: number
  isSelected: boolean
}

// Stacking offsets in pixels
const STACK_OFFSETS = [
  { dx: 0, dy: 0 },
  { dx: 20, dy: -16 },
  { dx: -20, dy: -16 },
  { dx: 20, dy: 16 },
  { dx: -20, dy: 16 },
]

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function CharacterMarker({
  character,
  locationX,
  locationY,
  containerSize,
  index,
  isSelected,
}: CharacterMarkerProps) {
  const { setSelected } = useAtlasStore()
  const offset = STACK_OFFSETS[index % STACK_OFFSETS.length]

  // Convert % coords to pixels, then apply offset and raise above location pin
  const cx = (locationX / 100) * containerSize.w + offset.dx
  const cy = (locationY / 100) * containerSize.h + offset.dy - 22
  const r = isSelected ? 15 : 13

  const opacity =
    character.status === 'dead' ? 0.2 : character.status === 'missing' ? 0.5 : 1

  const clipId = `char-clip-${character.id}`
  const imgId = `char-img-${character.id}`
  const hasThumbnail = Boolean(character.thumbnail)

  return (
    <motion.g
      initial={{ scale: 0, opacity: 0 }}
      animate={
        isSelected
          ? { scale: [1, 1.15, 1], opacity }
          : { scale: 1, opacity }
      }
      transition={
        isSelected
          ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 0.35, ease: 'backOut' }
      }
      style={{
        cursor: 'pointer',
        filter: isSelected ? `drop-shadow(0 0 6px ${character.color})` : undefined,
        transformOrigin: `${cx}px ${cy}px`,
      }}
      onClick={(e) => {
        e.stopPropagation()
        setSelected({ type: 'character', id: character.id })
      }}
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>

      {/* Glow ring on selection */}
      {isSelected && (
        <motion.g
          style={{ transformOrigin: `${cx}px ${cy}px` }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0.3, 0.8] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <circle cx={cx} cy={cy} r={r + 7} fill="none" stroke={character.color} strokeWidth="2" opacity={0.8} />
        </motion.g>
      )}

      {/* Colored border ring */}
      <circle
        cx={cx}
        cy={cy}
        r={r + 2.5}
        fill={character.color}
        opacity={isSelected ? 1 : 0.85}
        style={isSelected ? { filter: `drop-shadow(0 0 5px ${character.color})` } : undefined}
      />

      {/* Dark background */}
      <circle cx={cx} cy={cy} r={r} fill="#0d0d14" />

      {/* Portrait image or initials fallback */}
      {hasThumbnail ? (
        <image
          id={imgId}
          href={`${import.meta.env.BASE_URL}${character.thumbnail}`}
          x={cx - r}
          y={cy - r}
          width={r * 2}
          height={r * 2}
          clipPath={`url(#${clipId})`}
          preserveAspectRatio="xMidYMid slice"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      ) : (
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={r * 0.75}
          fill={character.color}
          fontFamily="'IBM Plex Mono', monospace"
          fontWeight="500"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {getInitials(character.name)}
        </text>
      )}

      {/* Missing/dead status overlay */}
      {character.status === 'missing' && (
        <circle cx={cx} cy={cy} r={r} fill="#000" opacity={0.45} />
      )}
      {character.status === 'dead' && (
        <>
          <circle cx={cx} cy={cy} r={r} fill="#000" opacity={0.7} />
          <line x1={cx - r * 0.5} y1={cy - r * 0.5} x2={cx + r * 0.5} y2={cy + r * 0.5}
            stroke={character.color} strokeWidth="2" opacity={0.5} />
          <line x1={cx + r * 0.5} y1={cy - r * 0.5} x2={cx - r * 0.5} y2={cy + r * 0.5}
            stroke={character.color} strokeWidth="2" opacity={0.5} />
        </>
      )}
    </motion.g>
  )
}
