import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useAtlasStore } from '../../store/atlasStore'
import { useMomentState } from '../../hooks/useMomentState'
import { LocationMarker } from './LocationMarker'
import { CharacterMarker } from './CharacterMarker'
import { ThemeOverlay } from '../ThemeOverlay/ThemeOverlay'

export function HawkinsMap() {
  const currentMomentId = useAtlasStore((s) => s.currentMomentId)
  const selectedEntity = useAtlasStore((s) => s.selectedEntity)
  const resolved = useMomentState(currentMomentId)
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 1440, h: 844 })

  // Track actual container pixel dimensions so SVG circles stay circular
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      if (width > 0 && height > 0) setSize({ w: width, h: height })
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

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
    <div ref={containerRef} className="relative w-full h-full">
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

      {/* SVG overlay — viewBox matches exact pixel dimensions so circles stay circular */}
      <AnimatePresence mode="wait">
        <motion.svg
          key={currentMomentId}
          className="absolute inset-0 w-full h-full"
          viewBox={`0 0 ${size.w} ${size.h}`}
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
              containerSize={size}
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
                containerSize={size}
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
