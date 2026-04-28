import { AnimatePresence, motion } from 'framer-motion'
import { useAtlasStore } from '../../store/atlasStore'
import { useMomentState } from '../../hooks/useMomentState'
import { LocationMarker } from './LocationMarker'
import { CharacterMarker } from './CharacterMarker'
import { ThemeOverlay } from '../ThemeOverlay/ThemeOverlay'

export function HawkinsMap() {
  const { currentMomentId, selectedEntity } = useAtlasStore()
  const resolved = useMomentState(currentMomentId)

  // Group characters by locationId for stacking offset
  type ActiveChar = NonNullable<typeof resolved>['activeCharacters'][number]
  const charsByLocation: Record<string, ActiveChar[]> = {}
  if (resolved) {
    for (const char of resolved.activeCharacters) {
      if (!charsByLocation[char.locationId]) charsByLocation[char.locationId] = []
      charsByLocation[char.locationId].push(char)
    }
  }

  return (
    <div className="relative w-full h-full">
      {/* Base map image */}
      <img
        src={`${import.meta.env.BASE_URL}map.svg`}
        alt="Hawkins map"
        className="absolute inset-0 w-full h-full"
        style={{ objectFit: 'fill' }}
        draggable={false}
      />

      {/* Theme-based atmospheric overlay */}
      <ThemeOverlay />

      {/* SVG overlay for markers */}
      <AnimatePresence mode="wait">
        <motion.svg
          key={currentMomentId}
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {resolved?.activeLocations.map((loc) => (
            <LocationMarker
              key={loc.id}
              location={loc}
              isSelected={selectedEntity?.type === 'location' && selectedEntity.id === loc.id}
            />
          ))}

          {resolved?.activeLocations.map((loc) => {
            const chars = charsByLocation[loc.id] ?? []
            return chars.map((char, idx) => (
              <CharacterMarker
                key={char.id}
                character={char}
                locationX={loc.map.x}
                locationY={loc.map.y}
                index={idx}
                isSelected={selectedEntity?.type === 'character' && selectedEntity.id === char.id}
              />
            ))
          })}
        </motion.svg>
      </AnimatePresence>
    </div>
  )
}
