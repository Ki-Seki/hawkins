import momentsData from '../data/moments.json'
import type { Moment } from '../types'
import { useAtlasStore } from '../store/atlasStore'

const moments = [...(momentsData as Moment[])].sort((a, b) => a.sortKey - b.sortKey)

export function useTimeline() {
  const { currentMomentId, setMoment } = useAtlasStore()
  const currentIndex = moments.findIndex((m) => m.id === currentMomentId)
  const currentMoment = moments[currentIndex] ?? moments[0]

  return {
    moments,
    currentMoment,
    currentIndex,
    seek: setMoment,
    next: () => {
      if (currentIndex < moments.length - 1) setMoment(moments[currentIndex + 1].id)
    },
    prev: () => {
      if (currentIndex > 0) setMoment(moments[currentIndex - 1].id)
    },
    hasNext: currentIndex < moments.length - 1,
    hasPrev: currentIndex > 0,
  }
}
