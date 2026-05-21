import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState, useMemo, useCallback, memo } from 'react'
import { useAtlasStore, useMomentState } from '../store'
import { mapLayout, locationsById, momentsSorted } from '../data/catalog'
import type { Location, Character } from '../data/catalog'

const FOCUS_SCALE = 1.8
const FOCUS_DURATION = 0.8
const BASE_SCALE = 1.15

// ─── ThemeOverlay ─────────────────────────────────────────────────────────────

const THEME_COLORS: Record<string, { glow: string; fog: string }> = {
  default:      { glow: '#FF9800', fog: 'rgba(13,13,20,0.3)' },
  tense:        { glow: '#C62828', fog: 'rgba(198,40,40,0.15)' },
  nightmare:    { glow: '#4A148C', fog: 'rgba(74,20,140,0.2)' },
  'upside-down':{ glow: '#1A237E', fog: 'rgba(26,35,126,0.25)' },
}

function ThemeOverlay({ momentId }: { momentId: string }) {
  const resolved = useMomentState(momentId)
  if (!resolved) return null

  const { theme, fog: fogIntensity, glow } = resolved.momentState.visual
  const themeColors = THEME_COLORS[theme] ?? THEME_COLORS.default
  const glowColor = glow || themeColors.glow

  return (
    <>
      <motion.div
        key={`fog-${momentId}`}
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: fogIntensity }}
        transition={{ duration: 0.6 }}
        style={{ background: themeColors.fog }}
      />
      <motion.div
        key={`glow-${momentId}`}
        className="absolute inset-0 pointer-events-none animate-ambient-glow-pulse"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 0.6 }}
        style={{ background: `radial-gradient(circle at 50% 50%, ${glowColor}33 0%, transparent 60%)` }}
      />
      {theme === 'upside-down' && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1 }}
          style={{ background: 'linear-gradient(135deg, #1A237E 0%, #4A148C 100%)', mixBlendMode: 'color' }}
        />
      )}
      {theme === 'nightmare' && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ duration: 0.8 }}
          style={{ backgroundImage: 'radial-gradient(circle, rgba(74,20,140,0.3) 1px, transparent 1px)', backgroundSize: '50px 50px' }}
        />
      )}
    </>
  )
}

// ─── LocationMarker ───────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  active: '#F57F17',
  foreshadowed: '#7A5C20',
  dim: '#3a3a60',
}

interface LocationMarkerProps {
  location: Location & { status: string; emphasis: number }
  containerSize: { w: number; h: number }
  isSelected: boolean
}

const LocationMarker = memo(function LocationMarker({ location, containerSize, isSelected }: LocationMarkerProps) {
  const setSelected = useAtlasStore((s) => s.setSelected)
  if (location.status === 'hidden') return null

  const cx = (location.map.x / 100) * containerSize.w
  const cy = (location.map.y / 100) * containerSize.h
  const color = isSelected ? '#FF9800' : STATUS_COLORS[location.status] ?? '#3a3a60'

  if (location.status === 'dim') {
    return (
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ duration: 0.4 }}
        style={{ cursor: 'pointer' }} onClick={() => setSelected({ type: 'location', id: location.id })}>
        <circle cx={cx} cy={cy} r={2} fill="#3a3a60" />
      </motion.g>
    )
  }

  if (location.status === 'foreshadowed') {
    return (
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ duration: 0.4 }}
        style={{ cursor: 'pointer' }} onClick={() => setSelected({ type: 'location', id: location.id })}>
        <circle cx={cx} cy={cy} r={10} fill={color} opacity={0.08} />
        <circle cx={cx} cy={cy} r={4} fill="none" stroke={color} strokeWidth="1" />
        <circle cx={cx} cy={cy} r={1.5} fill={color} />
      </motion.g>
    )
  }

  const baseRadius = location.map.radius ?? 6
  const r = isSelected ? baseRadius + 1 : baseRadius

  return (
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
      style={{ cursor: 'pointer' }} onClick={() => setSelected({ type: 'location', id: location.id })}>
      <circle cx={cx} cy={cy} r={r + 8} fill="none" stroke={color} strokeWidth="1"
        className="animate-location-pulse" style={{ transformOrigin: `${cx}px ${cy}px` }} />
      <circle cx={cx} cy={cy} r={r + 6} fill={color} opacity={0.10}
        style={{ filter: `blur(${location.emphasis * 4}px)` }} />
      <circle cx={cx} cy={cy} r={r + 2} fill="#0d0d14" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="1.5"
        style={{ filter: `drop-shadow(0 0 ${location.emphasis * 3}px ${color})` }} />
      <circle cx={cx} cy={cy} r={2} fill="white" opacity={0.9} />
      {isSelected && (
        <circle cx={cx} cy={cy} r={r + 5} fill="none" stroke="#FF9800" strokeWidth="1.5"
          className="animate-selection-ring" style={{ transformOrigin: `${cx}px ${cy}px` }} />
      )}
      <text
        x={cx + (location.map.labelOffset?.x ?? 0) * containerSize.w / 100}
        y={cy + (location.map.labelOffset?.y ?? 0) * containerSize.h / 100 + r + 8}
        textAnchor="middle" dominantBaseline="hanging" fontSize="11"
        fill={color} opacity={0.9} fontFamily="'IBM Plex Mono', monospace"
        style={{ pointerEvents: 'none', letterSpacing: '0.08em', filter: `drop-shadow(0 0 4px ${color})` }}
      >
        {location.name.toUpperCase()}
      </text>
    </motion.g>
  )
})

// ─── CharacterMarker ──────────────────────────────────────────────────────────

const STACK_OFFSETS = [
  { dx: 0, dy: 0 }, { dx: 20, dy: -16 }, { dx: -20, dy: -16 },
  { dx: 20, dy: 16 }, { dx: -20, dy: 16 },
]

function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

interface CharacterMarkerProps {
  character: Character & { locationId: string; status: string }
  locationX: number
  locationY: number
  containerSize: { w: number; h: number }
  index: number
  isSelected: boolean
}

const CharacterMarker = memo(function CharacterMarker({
  character, locationX, locationY, containerSize, index, isSelected,
}: CharacterMarkerProps) {
  const setSelected = useAtlasStore((s) => s.setSelected)
  const offset = STACK_OFFSETS[index % STACK_OFFSETS.length]
  const cx = (locationX / 100) * containerSize.w + offset.dx
  const cy = (locationY / 100) * containerSize.h + offset.dy - 22
  const r = isSelected ? 15 : 13
  const opacity = character.status === 'dead' ? 0.2 : character.status === 'missing' ? 0.5 : 1
  const clipId = `char-clip-${character.id}`

  return (
    <motion.g
      initial={{ scale: 0, opacity: 0 }}
      animate={isSelected ? { scale: [1, 1.15, 1], opacity } : { scale: 1, opacity }}
      transition={isSelected
        ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
        : { duration: 0.35, ease: 'backOut' }}
      style={{
        cursor: 'pointer',
        filter: isSelected ? `drop-shadow(0 0 6px ${character.color})` : undefined,
        transformOrigin: `${cx}px ${cy}px`,
      }}
      onClick={(e) => { e.stopPropagation(); setSelected({ type: 'character', id: character.id }) }}
    >
      <defs>
        <clipPath id={clipId}><circle cx={cx} cy={cy} r={r} /></clipPath>
      </defs>
      {isSelected && (
        <circle cx={cx} cy={cy} r={r + 7} fill="none" stroke={character.color} strokeWidth="2"
          className="animate-character-glow" style={{ transformOrigin: `${cx}px ${cy}px` }} />
      )}
      <circle cx={cx} cy={cy} r={r + 2.5} fill={character.color} opacity={isSelected ? 1 : 0.85}
        style={isSelected ? { filter: `drop-shadow(0 0 5px ${character.color})` } : undefined} />
      <circle cx={cx} cy={cy} r={r} fill="#0d0d14" />
      {character.thumbnail ? (
        <image
          href={`${import.meta.env.BASE_URL}${character.thumbnail}`}
          x={cx - r} y={cy - r} width={r * 2} height={r * 2}
          clipPath={`url(#${clipId})`} preserveAspectRatio="xMidYMid slice"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
      ) : (
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
          fontSize={r * 0.75} fill={character.color} fontFamily="'IBM Plex Mono', monospace"
          fontWeight="500" style={{ pointerEvents: 'none', userSelect: 'none' }}>
          {getInitials(character.name)}
        </text>
      )}
      {character.status === 'missing' && <circle cx={cx} cy={cy} r={r} fill="#000" opacity={0.45} />}
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
})

// ─── CharacterMovementLines ──────────────────────────────────────────────────

interface MovementLine {
  characterId: string
  color: string
  fromX: number
  fromY: number
  toX: number
  toY: number
}

function CharacterMovementLines({
  currentMomentId,
  containerSize,
}: {
  currentMomentId: string
  containerSize: { w: number; h: number }
}) {
  const currentIdx = momentsSorted.findIndex((m) => m.id === currentMomentId)
  const prevMomentId = currentIdx > 0 ? momentsSorted[currentIdx - 1].id : currentMomentId

  const currentResolved = useMomentState(currentMomentId)
  const prevResolved = useMomentState(prevMomentId)
  const hasPrev = currentIdx > 0

  const lines = useMemo(() => {
    if (!currentResolved || !prevResolved || !hasPrev) return []
    const result: MovementLine[] = []
    for (const curChar of currentResolved.activeCharacters) {
      const prevChar = prevResolved.activeCharacters.find((c) => c.id === curChar.id)
      if (!prevChar || prevChar.locationId === curChar.locationId) continue
      const fromLoc = locationsById.get(prevChar.locationId)
      const toLoc = locationsById.get(curChar.locationId)
      if (!fromLoc || !toLoc) continue
      result.push({
        characterId: curChar.id,
        color: curChar.color,
        fromX: (fromLoc.map.x / 100) * containerSize.w,
        fromY: (fromLoc.map.y / 100) * containerSize.h,
        toX: (toLoc.map.x / 100) * containerSize.w,
        toY: (toLoc.map.y / 100) * containerSize.h,
      })
    }
    return result
  }, [currentResolved, prevResolved, containerSize, hasPrev])

  if (lines.length === 0) return null

  return (
    <>
      {lines.map((line) => (
        <motion.line
          key={`${line.characterId}-${line.fromX}-${line.toX}`}
          x1={line.fromX}
          y1={line.fromY}
          x2={line.toX}
          y2={line.toY}
          stroke={line.color}
          strokeWidth={1.5}
          strokeDasharray="6 4"
          strokeLinecap="round"
          opacity={0.6}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}
    </>
  )
}

// ─── HawkinsMap ───────────────────────────────────────────────────────────────

export function HawkinsMap() {
  const currentMomentId = useAtlasStore((s) => s.currentMomentId)
  const selectedEntity = useAtlasStore((s) => s.selectedEntity)
  const clearSelected = useAtlasStore((s) => s.clearSelected)
  const resolved = useMomentState(currentMomentId)
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 1440, h: 844 })

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

  const handleMapClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget && selectedEntity) clearSelected()
  }, [selectedEntity, clearSelected])

  type ActiveChar = NonNullable<typeof resolved>['activeCharacters'][number]
  const charsByLocation = useMemo(() => {
    const result: Record<string, ActiveChar[]> = {}
    if (resolved) {
      for (const char of resolved.activeCharacters) {
        if (!result[char.locationId]) result[char.locationId] = []
        result[char.locationId].push(char)
      }
    }
    return result
  }, [resolved])

  const layout = mapLayout as { svgPath: string }

  // Camera: compute transform for focusLocationId
  const focusLocation = resolved?.moment.focusLocationId
    ? locationsById.get(resolved.moment.focusLocationId)
    : null
  const cameraTransform = useMemo(() => {
    if (!focusLocation) {
      const tx = (size.w * (1 - BASE_SCALE)) / 2
      const ty = (size.h * (1 - BASE_SCALE)) / 2
      return { scale: BASE_SCALE, x: tx, y: ty }
    }
    const cx = (focusLocation.map.x / 100) * size.w
    const cy = (focusLocation.map.y / 100) * size.h
    const tx = size.w / 2 - cx * FOCUS_SCALE
    const ty = size.h / 2 - cy * FOCUS_SCALE
    return { scale: FOCUS_SCALE, x: tx, y: ty }
  }, [focusLocation, size.w, size.h])

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden" style={{ backgroundColor: '#0d0d14' }} onClick={handleMapClick}>
      <motion.div
        className="relative w-full h-full"
        animate={{ scale: cameraTransform.scale, x: cameraTransform.x, y: cameraTransform.y }}
        transition={{ duration: FOCUS_DURATION, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ transformOrigin: '0 0' }}
      >
        <img
          src={`${import.meta.env.BASE_URL}${layout.svgPath}`}
          alt="Hawkins map"
          className="absolute inset-0 w-full h-full"
          style={{ objectFit: 'cover' }}
          draggable={false}
        />

        <ThemeOverlay momentId={currentMomentId} />

        {/* Map edge fade — blends map edges into background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 50%, #0d0d14 100%)',
          }}
        />

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
            <CharacterMovementLines currentMomentId={currentMomentId} containerSize={size} />
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
      </motion.div>
    </div>
  )
}
