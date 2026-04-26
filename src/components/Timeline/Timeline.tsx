import { useTimeline } from '../../hooks/useTimeline'
import { useAtlasStore } from '../../store/atlasStore'
import episodesData from '../../data/episodes.json'
import type { Episode } from '../../types'

const episodes = episodesData as Episode[]

function getEpisodeLabel(episodeId: string): string {
  const ep = episodes.find((e) => e.id === episodeId)
  if (!ep) return ''
  return `S${String(ep.season).padStart(2, '0')}E${String(ep.episode).padStart(2, '0')}`
}

export function Timeline() {
  const { moments, currentMoment, currentIndex, seek, next, prev, hasNext, hasPrev } =
    useTimeline()
  const { isPlaying, setPlaying } = useAtlasStore()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 h-24 bg-dim/90 backdrop-blur-sm border-t border-white/10">
      <div className="flex items-center h-full px-4 gap-4">

        {/* Episode label */}
        <div className="flex-shrink-0 w-16 text-center">
          <span className="text-hawkins-amber font-mono text-xs tracking-widest uppercase">
            {getEpisodeLabel(currentMoment?.episodeId ?? '')}
          </span>
        </div>

        {/* Prev button */}
        <button
          onClick={prev}
          disabled={!hasPrev}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-white/60 hover:text-white disabled:opacity-25 transition-colors"
          aria-label="Previous moment"
        >
          ◀
        </button>

        {/* Timeline scrubber */}
        <div className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-none">
          {moments.map((m, idx) => {
            const isActive = m.id === currentMoment?.id
            const isPast = idx < currentIndex
            return (
              <button
                key={m.id}
                onClick={() => seek(m.id)}
                title={m.title}
                className={[
                  'flex-shrink-0 h-2 rounded-full transition-all duration-300',
                  isActive
                    ? 'w-6 bg-hawkins-amber shadow-[0_0_8px_#F57F17]'
                    : isPast
                    ? 'w-2 bg-white/30 hover:bg-white/50'
                    : 'w-2 bg-white/10 hover:bg-white/30',
                ].join(' ')}
                aria-label={m.title}
              />
            )
          })}
        </div>

        {/* Next button */}
        <button
          onClick={next}
          disabled={!hasNext}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-white/60 hover:text-white disabled:opacity-25 transition-colors"
          aria-label="Next moment"
        >
          ▶
        </button>

        {/* Play/pause */}
        <button
          onClick={() => setPlaying(!isPlaying)}
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full border border-hawkins-amber/40 text-hawkins-amber hover:bg-hawkins-amber/10 transition-colors"
          aria-label={isPlaying ? 'Pause autoplay' : 'Start autoplay'}
        >
          {isPlaying ? '⏸' : '⏵'}
        </button>

        {/* Moment info (center, overlapping) */}
        <div className="absolute left-1/2 bottom-6 -translate-x-1/2 text-center pointer-events-none">
          <p className="text-white font-display text-sm leading-none">
            {currentMoment?.title}
          </p>
          <p className="text-white/40 font-mono text-xs mt-0.5 tracking-wide">
            {currentMoment?.timeLabel}
          </p>
        </div>

      </div>
    </div>
  )
}
