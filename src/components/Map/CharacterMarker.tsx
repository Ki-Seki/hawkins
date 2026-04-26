import { motion } from 'framer-motion'
import type { Character } from '../../types'
import { useAtlasStore } from '../../store/atlasStore'

interface CharacterMarkerProps {
  character: Character & { locationId: string; status: string }
  locationX: number
  locationY: number
  index: number
  isSelected: boolean
}

const STACK_OFFSETS = [
  { dx: 0, dy: 0 },
  { dx: 3, dy: -3 },
  { dx: -3, dy: -3 },
  { dx: 3, dy: 3 },
  { dx: -3, dy: 3 },
]

export function CharacterMarker({
  character,
  locationX,
  locationY,
  index,
  isSelected,
}: CharacterMarkerProps) {
  const { setSelected } = useAtlasStore()
  const offset = STACK_OFFSETS[index % STACK_OFFSETS.length]
  const cx = locationX + offset.dx
  const cy = locationY + offset.dy - 5

  const opacity =
    character.status === 'dead' ? 0.25 : character.status === 'missing' ? 0.5 : 1

  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r={isSelected ? 3 : 2.2}
      fill={character.color}
      opacity={opacity}
      initial={{ scale: 0, opacity: 0 }}
      animate={
        isSelected
          ? { scale: [1, 1.4, 1], opacity }
          : { scale: 1, opacity }
      }
      transition={
        isSelected
          ? { duration: 1, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 0.3 }
      }
      style={{
        cursor: 'pointer',
        filter: isSelected ? `drop-shadow(0 0 4px ${character.color})` : undefined,
      }}
      onClick={(e) => {
        e.stopPropagation()
        setSelected({ type: 'character', id: character.id })
      }}
    />
  )
}
