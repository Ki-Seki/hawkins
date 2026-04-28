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
    <div
      className="fixed bottom-0 left-0 right-0 z-30 h-14"
      style={{
        background: 'linear-gradient(to top, rgba(8,8,14,0.97) 0%, rgba(13,13,20,0.7) 100%)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(245,127,23,0.12)',
      }}
    >
      <div className="flex items-center h-full px-5 gap-3">

        {/* Episode + moment title */}
        <div className="flex-shrink-0 flex items-center gap-2 min-w-0 w-52">
          <span
            className="font-mono text-[11px] tracking-[0.25em] uppercase text-hawkins-amber flex-shrink-0"
            style={{ textShadow: '0 0 10px rgba(245,127,23,0.6)' }}
          >
            {getEpisodeLabel(currentMoment?.episodeId ?? '')}
          </span>
          <span className="text-hawkins-amber/30 text-xs flex-shrink-0">·</span>
          <span className="text-white/50 font-mono text-[10px] truncate tracking-wide">
            {currentMoment?.title}
          </span>
        </div>

        {/* Prev */}
        <button
          onClick={prev}
          disabled={!hasPrev}
          className="flex-shrink-0 text-white/30 hover:text-hawkins-amber hover:scale-110 disabled:opacity-15 disabled:hover:scale-100 transition-all duration-200"
          aria-label="Previous moment"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <polygon points="10,2 4,7 10,12" />
          </svg>
        </button>

        {/* Timeline dots */}
        <div className="flex-1 flex items-center gap-[3px] overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
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
                    ? 'h-[5px] w-5 bg-hawkins-amber'
                    : isPast
                    ? 'h-[3px] w-[3px] bg-white/40 hover:bg-white/60 hover:scale-150'
                    : 'h-[3px] w-[3px] bg-white/15 hover:bg-white/35 hover:scale-150',
                ].join(' ')}
                style={isActive ? { boxShadow: '0 0 6px #F57F17, 0 0 12px rgba(245,127,23,0.35)' } : undefined}
                aria-label={m.title}
                aria-current={isActive ? 'true' : undefined}
              />
            )
          })}
        </div>

        {/* Next */}
        <button
          onClick={next}
          disabled={!hasNext}
          className="flex-shrink-0 text-white/30 hover:text-hawkins-amber hover:scale-110 disabled:opacity-15 disabled:hover:scale-100 transition-all duration-200"
          aria-label="Next moment"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <polygon points="4,2 10,7 4,12" />
          </svg>
        </button>

        {/* Play/pause */}
        <button
          onClick={() => setPlaying(!isPlaying)}
          className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full border transition-all hover:scale-110 duration-200"
          style={
            isPlaying
              ? { borderColor: 'rgba(245,127,23,0.7)', color: '#F57F17', boxShadow: '0 0 10px rgba(245,127,23,0.25)' }
              : { borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.35)' }
          }
          aria-label={isPlaying ? 'Pause' : 'Play'}
          aria-pressed={isPlaying}
        >
          {isPlaying ? (
            <svg width="8" height="10" viewBox="0 0 8 10" fill="currentColor">
              <rect x="0" y="0" width="3" height="10" />
              <rect x="5" y="0" width="3" height="10" />
            </svg>
          ) : (
            <svg width="8" height="10" viewBox="0 0 8 10" fill="currentColor">
              <polygon points="0,0 8,5 0,10" />
            </svg>
          )}
        </button>

      </div>
    </div>
  )
}
