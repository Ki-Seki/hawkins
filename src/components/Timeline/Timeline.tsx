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
    <div className="fixed bottom-0 left-0 right-0 z-30 h-24 border-t border-white/8"
      style={{ background: 'linear-gradient(to top, rgba(13,13,20,0.98) 0%, rgba(13,13,20,0.9) 100%)', backdropFilter: 'blur(12px)' }}>
      <div className="flex items-center h-full px-4 gap-4">

        {/* Episode label */}
        <div className="flex-shrink-0 w-16 text-center">
          <span className="text-hawkins-amber font-mono text-xs tracking-[0.2em] uppercase"
            style={{ textShadow: '0 0 8px rgba(245,127,23,0.5)' }}>
            {getEpisodeLabel(currentMoment?.episodeId ?? '')}
          </span>
        </div>

        {/* Prev button */}
        <button
          onClick={prev}
          disabled={!hasPrev}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-white/50 hover:text-hawkins-amber disabled:opacity-20 transition-colors text-xs"
          aria-label="Previous moment"
        >
          ◀
        </button>

        {/* Timeline scrubber */}
        <div className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
          {moments.map((m, idx) => {
            const isActive = m.id === currentMoment?.id
            const isPast = idx < currentIndex
            return (
              <button
                key={m.id}
                onClick={() => seek(m.id)}
                title={m.title}
                className={[
                  'flex-shrink-0 rounded-full transition-all duration-300',
                  isActive
                    ? 'h-3 w-7 bg-hawkins-amber'
                    : isPast
                    ? 'h-1.5 w-1.5 bg-white/35 hover:bg-white/55 hover:h-2.5'
                    : 'h-1.5 w-1.5 bg-white/12 hover:bg-white/30 hover:h-2.5',
                ].join(' ')}
                style={isActive ? { boxShadow: '0 0 8px #F57F17, 0 0 16px rgba(245,127,23,0.4)' } : undefined}
                aria-label={m.title}
              />
            )
          })}
        </div>

        {/* Next button */}
        <button
          onClick={next}
          disabled={!hasNext}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-white/50 hover:text-hawkins-amber disabled:opacity-20 transition-colors text-xs"
          aria-label="Next moment"
        >
          ▶
        </button>

        {/* Play/pause */}
        <button
          onClick={() => setPlaying(!isPlaying)}
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full border border-hawkins-amber/50 text-hawkins-amber hover:bg-hawkins-amber/15 transition-all text-sm"
          style={isPlaying ? { boxShadow: '0 0 12px rgba(245,127,23,0.3)' } : undefined}
          aria-label={isPlaying ? 'Pause autoplay' : 'Start autoplay'}
        >
          {isPlaying ? '⏸' : '⏵'}
        </button>

        {/* Moment info (center, overlapping) */}
        <div className="absolute left-1/2 bottom-5 -translate-x-1/2 text-center pointer-events-none">
          <p className="text-white font-display text-sm leading-none tracking-wide">
            {currentMoment?.title}
          </p>
          <p className="text-hawkins-amber/60 font-mono text-[10px] mt-0.5 tracking-widest uppercase">
            {currentMoment?.timeLabel}
          </p>
        </div>

      </div>
    </div>
  )
}
