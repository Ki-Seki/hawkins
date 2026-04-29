import { create } from 'zustand'
import {
  momentsSorted,
  momentsById,
  momentStatesById,
  charactersById,
  locationsById,
} from './data/catalog'
import type { Character, Location, Moment, MomentState } from './data/catalog'

// ─── Shared types ─────────────────────────────────────────────────────────────

export type EntityType = 'location' | 'character' | 'event'
export interface SelectedEntity { type: EntityType; id: string }

// ─── Zustand store ────────────────────────────────────────────────────────────

interface AtlasStore {
  currentMomentId: string
  selectedEntity: SelectedEntity | null
  isPlaying: boolean
  setMoment: (id: string) => void
  setSelected: (entity: SelectedEntity) => void
  clearSelected: () => void
  setPlaying: (playing: boolean) => void
}

export const useAtlasStore = create<AtlasStore>((set) => ({
  currentMomentId: 's01e01-cold-open',
  selectedEntity: null,
  isPlaying: false,
  setMoment: (id) => set({ currentMomentId: id }),
  setSelected: (entity) => set({ selectedEntity: entity }),
  clearSelected: () => set({ selectedEntity: null }),
  setPlaying: (playing) => set({ isPlaying: playing }),
}))

// ─── useTimeline ──────────────────────────────────────────────────────────────

export function useTimeline() {
  const currentMomentId = useAtlasStore((s) => s.currentMomentId)
  const setMoment = useAtlasStore((s) => s.setMoment)
  const currentIndex = momentsSorted.findIndex((m) => m.id === currentMomentId)
  const currentMoment = momentsById.get(currentMomentId) ?? momentsSorted[0]

  return {
    moments: momentsSorted,
    currentMoment,
    currentIndex,
    seek: setMoment,
    next: () => {
      if (currentIndex < momentsSorted.length - 1) setMoment(momentsSorted[currentIndex + 1].id)
    },
    prev: () => {
      if (currentIndex > 0) setMoment(momentsSorted[currentIndex - 1].id)
    },
    hasNext: currentIndex < momentsSorted.length - 1,
    hasPrev: currentIndex > 0,
  }
}

// ─── useMomentState ───────────────────────────────────────────────────────────

export interface ResolvedMomentState {
  moment: Moment
  momentState: MomentState
  activeLocations: Array<Location & { status: string; emphasis: number }>
  activeCharacters: Array<Character & { locationId: string; status: string }>
}

export function useMomentState(momentId: string): ResolvedMomentState | null {
  const moment = momentsById.get(momentId)
  const momentState = momentStatesById.get(momentId)
  if (!moment || !momentState) return null

  const activeLocations = momentState.locationStates
    .filter((ls) => ls.status !== 'hidden')
    .map((ls) => {
      const loc = locationsById.get(ls.locationId)
      if (!loc) return null
      return { ...loc, status: ls.status, emphasis: ls.emphasis }
    })
    .filter(Boolean) as Array<Location & { status: string; emphasis: number }>

  const activeCharacters = momentState.characterStates
    .map((cs) => {
      const char = charactersById.get(cs.characterId)
      if (!char) return null
      return { ...char, locationId: cs.locationId, status: cs.status }
    })
    .filter(Boolean) as Array<Character & { locationId: string; status: string }>

  return { moment, momentState, activeLocations, activeCharacters }
}
