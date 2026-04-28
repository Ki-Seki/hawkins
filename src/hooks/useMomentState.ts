import {
  momentsById,
  momentStatesById,
  charactersById,
  locationsById,
} from '../data/catalog'
import type { Moment, MomentState, Character, Location } from '../types'

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
