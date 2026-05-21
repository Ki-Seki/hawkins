import { z } from 'zod'

import rawCharacters from './characters.json'
import rawLocations from './locations.json'
import rawEpisodes from './episodes.json'
import rawEvents from './events.json'
import rawMoments from './moments.json'
import rawMomentStates from './moment-states.json'
import rawMapLayout from './map-layout.json'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Character {
  id: string
  name: string
  aliases: string[]
  description: string
  tags: string[]
  homeLocationId: string
  color: string
  image: string
  thumbnail?: string
}

export interface Location {
  id: string
  name: string
  type: 'house' | 'school' | 'lab' | 'woods' | 'road' | 'mall' | 'bunker' | 'hospital' | 'store' | 'prison' | 'other'
  description: string
  tags: string[]
  map: {
    x: number
    y: number
    labelOffset?: { x: number; y: number }
    radius?: number
  }
  image?: string
}

export interface Episode {
  id: string
  season: number
  episode: number
  title: string
}

export interface StrangerEvent {
  id: string
  title: string
  description: string
  episodeIds: string[]
  locationIds: string[]
  characterIds: string[]
  tags: string[]
}

export interface Moment {
  id: string
  title: string
  timeLabel: string
  sortKey: number
  episodeId: string
  eventIds: string[]
  activeCharacterIds: string[]
  activeLocationIds: string[]
  focusLocationId?: string
  summary: string
  nextMomentId?: string | null
}

export interface LocationState {
  locationId: string
  status: 'active' | 'foreshadowed' | 'dim' | 'hidden'
  emphasis: number
}

export interface CharacterState {
  characterId: string
  locationId: string
  status: 'present' | 'missing' | 'trapped' | 'dead'
}

export interface MomentState {
  momentId: string
  locationStates: LocationState[]
  characterStates: CharacterState[]
  visual: {
    theme: 'default' | 'tense' | 'nightmare' | 'upside-down'
    fog: number
    glow: string
    cameraTarget?: string
  }
  audio?: { ambient?: string; sfx?: string }
  video?: { background?: string }
}

export interface MapLayout {
  canvasWidth: number
  canvasHeight: number
  svgPath: string
  defaultTheme: string
  regions: Array<{
    id: string
    label: string
    bounds: { x: number; y: number; w: number; h: number }
  }>
}

// Zod schemas for runtime validation
const CharacterSchema = z.object({
  id: z.string(),
  name: z.string(),
  aliases: z.array(z.string()),
  description: z.string(),
  tags: z.array(z.string()),
  homeLocationId: z.string(),
  color: z.string(),
  image: z.string(),
  thumbnail: z.string().optional(),
})

const LocationSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['house', 'school', 'lab', 'woods', 'road', 'mall', 'bunker', 'hospital', 'store', 'prison', 'other']),
  description: z.string(),
  tags: z.array(z.string()),
  map: z.object({
    x: z.number(),
    y: z.number(),
    labelOffset: z.object({ x: z.number(), y: z.number() }).optional(),
    radius: z.number().optional(),
  }),
  image: z.string().optional(),
})

const EpisodeSchema = z.object({
  id: z.string(),
  season: z.number(),
  episode: z.number(),
  title: z.string(),
})

const EventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  episodeIds: z.array(z.string()),
  locationIds: z.array(z.string()),
  characterIds: z.array(z.string()),
  tags: z.array(z.string()),
})

const MomentSchema = z.object({
  id: z.string(),
  title: z.string(),
  timeLabel: z.string(),
  sortKey: z.number(),
  episodeId: z.string(),
  eventIds: z.array(z.string()),
  activeCharacterIds: z.array(z.string()),
  activeLocationIds: z.array(z.string()),
  focusLocationId: z.string().optional(),
  summary: z.string(),
  nextMomentId: z.string().nullable().optional(),
})

const MomentStateSchema = z.object({
  momentId: z.string(),
  locationStates: z.array(
    z.object({
      locationId: z.string(),
      status: z.enum(['active', 'foreshadowed', 'dim', 'hidden']),
      emphasis: z.number(),
    })
  ),
  characterStates: z.array(
    z.object({
      characterId: z.string(),
      locationId: z.string(),
      status: z.enum(['present', 'missing', 'trapped', 'dead']),
    })
  ),
  visual: z.object({
    theme: z.enum(['default', 'tense', 'nightmare', 'upside-down']),
    fog: z.number(),
    glow: z.string(),
    cameraTarget: z.string().optional(),
  }),
  audio: z
    .object({
      ambient: z.string().optional(),
      sfx: z.string().optional(),
    })
    .optional(),
  video: z
    .object({
      background: z.string().optional(),
    })
    .optional(),
})

const MapLayoutSchema = z.object({
  canvasWidth: z.number(),
  canvasHeight: z.number(),
  svgPath: z.string(),
  defaultTheme: z.string(),
  regions: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      bounds: z.object({
        x: z.number(),
        y: z.number(),
        w: z.number(),
        h: z.number(),
      }),
    })
  ),
})

// Parse and validate all data
export const characters = CharacterSchema.array().parse(rawCharacters) as Character[]
export const locations = LocationSchema.array().parse(rawLocations) as Location[]
export const episodes = EpisodeSchema.array().parse(rawEpisodes) as Episode[]
export const events = EventSchema.array().parse(rawEvents) as StrangerEvent[]
export const moments = MomentSchema.array().parse(rawMoments) as Moment[]
// Apply defaults: fill unspecified locations as dim/0.1 so moment-states
// only need to list active, foreshadowed, or non-default locations.
function applyDefaults(ms: MomentState): MomentState {
  const allLocationIds = locations.map((l) => l.id)
  const specifiedIds = new Set(ms.locationStates.map((ls) => ls.locationId))
  const defaults = allLocationIds
    .filter((id) => !specifiedIds.has(id))
    .map((id) => ({ locationId: id, status: 'dim' as const, emphasis: 0.1 }))
  return {
    ...ms,
    locationStates: [...ms.locationStates, ...defaults],
  }
}

export const momentStates = MomentStateSchema.array()
  .parse(rawMomentStates)
  .map(applyDefaults)
// Not typed to avoid pulling MapLayout into every catalog consumer; cast in HawkinsMap if needed
export const mapLayout = MapLayoutSchema.parse(rawMapLayout)

// Build indexed lookups for O(1) access
export const charactersById = new Map(characters.map((c) => [c.id, c]))
export const locationsById = new Map(locations.map((l) => [l.id, l]))
export const episodesById = new Map(episodes.map((e) => [e.id, e]))
export const eventsById = new Map(events.map((e) => [e.id, e]))
export const momentsById = new Map(moments.map((m) => [m.id, m]))
export const momentStatesById = new Map(momentStates.map((ms) => [ms.momentId, ms]))

// Sorted moments for timeline (cached)
export const momentsSorted = [...moments].sort((a, b) => a.sortKey - b.sortKey)

export function getSeason(moment: Moment): number {
  const ep = episodesById.get(moment.episodeId)
  return ep?.season ?? 1
}

// Helper to get entity by type and id
export function getEntityById(
  type: 'character' | 'location' | 'event',
  id: string
): Character | Location | StrangerEvent | null {
  if (type === 'character') return charactersById.get(id) ?? null
  if (type === 'location') return locationsById.get(id) ?? null
  if (type === 'event') return eventsById.get(id) ?? null
  return null
}
