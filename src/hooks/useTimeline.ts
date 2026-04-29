import { momentsSorted, momentsById } from '../data/catalog'
import { useAtlasStore } from '../store/atlasStore'

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
      if (currentIndex < momentsSorted.length - 1) {
        setMoment(momentsSorted[currentIndex + 1].id)
      }
    },
    prev: () => {
      if (currentIndex > 0) {
        setMoment(momentsSorted[currentIndex - 1].id)
      }
    },
    hasNext: currentIndex < momentsSorted.length - 1,
    hasPrev: currentIndex > 0,
  }
}
