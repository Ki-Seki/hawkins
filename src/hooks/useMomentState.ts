import momentsData from '../data/moments.json'
import momentStatesData from '../data/moment-states.json'
import charactersData from '../data/characters.json'
import locationsData from '../data/locations.json'
import type { Moment, MomentState, Character, Location } from '../types'

export interface ResolvedMomentState {
  moment: Moment
  momentState: MomentState
  activeLocations: Array<Location & { status: string; emphasis: number }>
  activeCharacters: Array<Character & { locationId: string; status: string }>
}

export function useMomentState(momentId: string): ResolvedMomentState | null {
  const moment = (momentsData as Moment[]).find((m) => m.id === momentId)
  const momentState = (momentStatesData as MomentState[]).find((ms) => ms.momentId === momentId)
  if (!moment || !momentState) return null

  const activeLocations = momentState.locationStates
    .filter((ls) => ls.status !== 'hidden')
    .map((ls) => {
      const loc = (locationsData as Location[]).find((l) => l.id === ls.locationId)
      if (!loc) return null
      return { ...loc, status: ls.status, emphasis: ls.emphasis }
    })
    .filter(Boolean) as Array<Location & { status: string; emphasis: number }>

  const activeCharacters = momentState.characterStates
    .map((cs) => {
      const char = (charactersData as Character[]).find((c) => c.id === cs.characterId)
      if (!char) return null
      return { ...char, locationId: cs.locationId, status: cs.status }
    })
    .filter(Boolean) as Array<Character & { locationId: string; status: string }>

  return { moment, momentState, activeLocations, activeCharacters }
}
