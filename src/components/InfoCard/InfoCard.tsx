import { AnimatePresence, motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useAtlasStore } from '../../store/atlasStore'
import { getEntityById } from '../../data/catalog'
import type { Character, Location, StrangerEvent } from '../../types'

function getEntityName(entity: Character | Location | StrangerEvent): string {
  if ('name' in entity) return entity.name
  if ('title' in entity) return entity.title
  return ''
}

function getEntityDescription(entity: Character | Location | StrangerEvent): string {
  return entity.description
}

function getEntityTags(entity: Character | Location | StrangerEvent): string[] {
  return entity.tags
}

function getEntityColor(entity: Character | Location | StrangerEvent): string | undefined {
  if ('color' in entity) return entity.color
  return undefined
}

function getEntityImage(entity: Character | Location | StrangerEvent): string | undefined {
  if ('image' in entity && typeof entity.image === 'string') return entity.image
  return undefined
}

export function InfoCard() {
  const selectedEntity = useAtlasStore((s) => s.selectedEntity)
  const clearSelected = useAtlasStore((s) => s.clearSelected)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const entity = selectedEntity ? getEntityById(selectedEntity.type, selectedEntity.id) : null

  // Reset image loading state when entity changes
  useEffect(() => {
    setImageLoaded(false)
    setImageError(false)
  }, [selectedEntity?.id])

  return (
    <AnimatePresence>
      {entity && selectedEntity && (
        <motion.div
          key={selectedEntity.id}
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 40, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed right-0 top-0 bottom-14 z-20 w-80 bg-dim/95 backdrop-blur-md border-l border-white/10 flex flex-col overflow-hidden"
          role="dialog"
          aria-labelledby="infocard-title"
          aria-describedby="infocard-description"
          aria-modal="true"
        >
          {/* Color accent strip */}
          {getEntityColor(entity) && (
            <div
              className="h-1 flex-shrink-0"
              style={{ backgroundColor: getEntityColor(entity) }}
              aria-hidden="true"
            />
          )}

          {/* Header */}
          <div className="flex items-start justify-between p-5 pb-3">
            <div className="flex-1 min-w-0 pr-2">
              <p
                className="font-mono text-xs uppercase tracking-widest mb-1 opacity-70"
                style={{ color: getEntityColor(entity) ?? '#F57F17' }}
                aria-label={`Type: ${selectedEntity.type}`}
              >
                {selectedEntity.type}
              </p>
              <h2 id="infocard-title" className="text-white font-display text-lg leading-tight">
                {getEntityName(entity)}
              </h2>
            </div>
            <button
              onClick={clearSelected}
              className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              aria-label={`Close ${getEntityName(entity)} details`}
            >
              ×
            </button>
          </div>

          {/* Image placeholder or actual image — square 1:1 */}
          <div className="mx-4 mb-3 rounded overflow-hidden bg-white/5 flex-shrink-0 aspect-square w-[calc(100%-2rem)] relative">
            {getEntityImage(entity) ? (
              <>
                {!imageLoaded && !imageError && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      className="w-8 h-8 border-2 border-hawkins-amber/30 border-t-hawkins-amber rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>
                )}
                <img
                  src={`${import.meta.env.BASE_URL}${getEntityImage(entity)}`}
                  alt={getEntityName(entity)}
                  className="w-full h-full object-cover"
                  style={{ opacity: imageLoaded ? 1 : 0 }}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => {
                    setImageError(true)
                    setImageLoaded(false)
                  }}
                />
                {imageError && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white/15 font-mono text-xs uppercase tracking-widest">
                      Image Failed
                    </span>
                  </div>
                )}
              </>
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
            <p id="infocard-description" className="text-white/80 text-sm leading-relaxed font-sans">
              {getEntityDescription(entity)}
            </p>

            {/* Tags */}
            {getEntityTags(entity).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3" role="list" aria-label="Tags">
                {getEntityTags(entity).map((tag) => (
                  <span
                    key={tag}
                    role="listitem"
                    className="px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-white/60 font-mono text-xs"
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
