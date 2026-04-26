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
  type: 'house' | 'school' | 'lab' | 'woods' | 'road' | 'other'
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
  audio?: {
    ambient?: string
    sfx?: string
  }
  video?: {
    background?: string
  }
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

export type EntityType = 'location' | 'character' | 'event'
export interface SelectedEntity { type: EntityType; id: string }
