import { create } from 'zustand'
import {
  momentsSorted,
  momentsById,
  momentStatesById,
  charactersById,
  locationsById,
  episodesById,
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
  currentSeason: number
  setMoment: (id: string) => void
  setSelected: (entity: SelectedEntity) => void
  clearSelected: () => void
  setPlaying: (playing: boolean) => void
  setCurrentSeason: (season: number) => void
}

export const useAtlasStore = create<AtlasStore>((set) => ({
  currentMomentId: 's01e01-cold-open',
  selectedEntity: null,
  isPlaying: false,
  currentSeason: 1,
  setMoment: (id) => set({ currentMomentId: id }),
  setSelected: (entity) => set({ selectedEntity: entity }),
  clearSelected: () => set({ selectedEntity: null }),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentSeason: (season) => set({ currentSeason: season }),
}))

// ─── useTimeline ──────────────────────────────────────────────────────────────

function getSeason(moment: Moment): number {
  const ep = episodesById.get(moment.episodeId)
  return ep?.season ?? 1
}

export function useTimeline() {
  const currentMomentId = useAtlasStore((s) => s.currentMomentId)
  const currentSeason = useAtlasStore((s) => s.currentSeason)
  const setMoment = useAtlasStore((s) => s.setMoment)
  const setCurrentSeason = useAtlasStore((s) => s.setCurrentSeason)

  const seasonMoments = momentsSorted.filter((m) => getSeason(m) === currentSeason)
  const currentIndex = seasonMoments.findIndex((m) => m.id === currentMomentId)
  const currentMoment = momentsById.get(currentMomentId) ?? momentsSorted[0]

  return {
    moments: seasonMoments,
    currentMoment,
    currentIndex: currentIndex >= 0 ? currentIndex : 0,
    seek: (id: string) => {
      const m = momentsById.get(id)
      if (m) {
        const s = getSeason(m)
        if (s !== currentSeason) setCurrentSeason(s)
        setMoment(id)
      }
    },
    next: () => {
      // Try next in current season first
      if (currentIndex >= 0 && currentIndex < seasonMoments.length - 1) {
        setMoment(seasonMoments[currentIndex + 1].id)
      } else if (currentSeason < 5) {
        // Advance to next season's first moment
        const nextSeason = currentSeason + 1
        setCurrentSeason(nextSeason)
        const nextFirst = momentsSorted.find((m) => getSeason(m) === nextSeason)
        if (nextFirst) setMoment(nextFirst.id)
      }
    },
    prev: () => {
      if (currentIndex > 0) {
        setMoment(seasonMoments[currentIndex - 1].id)
      } else if (currentSeason > 1) {
        const prevSeason = currentSeason - 1
        setCurrentSeason(prevSeason)
        const prevSeasonMoments = momentsSorted.filter((m) => getSeason(m) === prevSeason)
        if (prevSeasonMoments.length > 0) setMoment(prevSeasonMoments[prevSeasonMoments.length - 1].id)
      }
    },
    hasNext: currentIndex < seasonMoments.length - 1 || currentSeason < 4,
    hasPrev: currentIndex > 0 || currentSeason > 1,
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
