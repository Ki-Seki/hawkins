import { AnimatePresence, motion } from 'framer-motion'
import { useAtlasStore } from '../../store/atlasStore'
import charactersData from '../../data/characters.json'
import locationsData from '../../data/locations.json'
import eventsData from '../../data/events.json'
import type { Character, Location, StrangerEvent } from '../../types'

const characters = charactersData as Character[]
const locations = locationsData as Location[]
const events = eventsData as StrangerEvent[]

function resolveEntity(type: string, id: string) {
  if (type === 'character') return characters.find((c) => c.id === id) ?? null
  if (type === 'location') return locations.find((l) => l.id === id) ?? null
  if (type === 'event') return events.find((e) => e.id === id) ?? null
  return null
}

function getEntityName(entity: Character | Location | StrangerEvent): string {
  if ('name' in entity) return entity.name
  if ('title' in entity) return (entity as StrangerEvent).title
  return ''
}

function getEntityDescription(entity: Character | Location | StrangerEvent): string {
  return entity.description
}

function getEntityTags(entity: Character | Location | StrangerEvent): string[] {
  return entity.tags
}

function getEntityColor(entity: Character | Location | StrangerEvent): string | undefined {
  if ('color' in entity) return (entity as Character).color
  return undefined
}

function getEntityImage(entity: Character | Location | StrangerEvent): string | undefined {
  if ('image' in entity && typeof entity.image === 'string') return entity.image
  return undefined
}

export function InfoCard() {
  const { selectedEntity, clearSelected } = useAtlasStore()

  const entity =
    selectedEntity ? resolveEntity(selectedEntity.type, selectedEntity.id) : null

  return (
    <AnimatePresence>
      {entity && (
        <motion.div
          key={selectedEntity!.id}
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 40, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed right-0 top-0 bottom-24 z-20 w-80 bg-dim/95 backdrop-blur-md border-l border-white/10 flex flex-col overflow-hidden"
        >
          {/* Color accent strip */}
          {getEntityColor(entity) && (
            <div
              className="h-1 flex-shrink-0"
              style={{ backgroundColor: getEntityColor(entity) }}
            />
          )}

          {/* Header */}
          <div className="flex items-start justify-between p-4 pb-2">
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-hawkins-amber font-mono text-xs uppercase tracking-widest mb-1 opacity-60">
                {selectedEntity!.type}
              </p>
              <h2 className="text-white font-display text-lg leading-tight">
                {getEntityName(entity)}
              </h2>
            </div>
            <button
              onClick={clearSelected}
              className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Image placeholder or actual image */}
          <div className="mx-4 mb-3 rounded overflow-hidden bg-white/5 flex-shrink-0" style={{ height: '120px' }}>
            {getEntityImage(entity) ? (
              <img
                src={`${import.meta.env.BASE_URL}${getEntityImage(entity)}`}
                alt={getEntityName(entity)}
                className="w-full h-full object-cover"
                onError={(e) => {
                  ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-white/15 font-mono text-xs uppercase tracking-widest">
                  No Image
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="px-4 flex-1 overflow-y-auto">
            <p className="text-white/70 text-sm leading-relaxed font-body">
              {getEntityDescription(entity)}
            </p>

            {/* Tags */}
            {getEntityTags(entity).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {getEntityTags(entity).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full bg-white/8 border border-white/15 text-white/50 font-mono text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="h-4 flex-shrink-0" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
