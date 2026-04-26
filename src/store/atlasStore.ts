import { create } from 'zustand'
import type { SelectedEntity } from '../types'

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
