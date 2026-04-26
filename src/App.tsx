import { motion } from 'framer-motion'

export default function App() {
  return (
    <div className="relative min-h-screen bg-dim flex items-center justify-center overflow-hidden">
      {/* Atmospheric effects */}
      <div className="grain" />
      <div className="vignette" />

      {/* Subtle background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(197,40,40,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(197,40,40,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="relative z-10 text-center px-6"
      >
        {/* Season / year badge */}
        <motion.p
          initial={{ opacity: 0, letterSpacing: '0.4em' }}
          animate={{ opacity: 0.45, letterSpacing: '0.5em' }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="font-body text-xs text-hawkins-amber uppercase mb-8"
        >
          Hawkins, Indiana · 1983
        </motion.p>

        {/* Title */}
        <motion.h1
          className="font-display text-6xl md:text-8xl text-hawkins-red uppercase tracking-widest"
          animate={{
            textShadow: [
              '0 0 20px rgba(198,40,40,0.4)',
              '0 0 45px rgba(198,40,40,0.7)',
              '0 0 20px rgba(198,40,40,0.4)',
            ],
          }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          Hawkins Atlas
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="font-body text-sm text-hawkins-amber tracking-widest mt-4"
        >
          An Interactive Geospatial Timeline of Stranger Things
        </motion.p>

        {/* Animated divider */}
        <motion.div
          className="mx-auto mt-10 w-px bg-hawkins-amber"
          animate={{ height: [32, 56, 32], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Coming soon */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.25 }}
          transition={{ duration: 1, delay: 1 }}
          className="font-body text-xs text-white uppercase tracking-[0.3em] mt-6"
        >
          Coming Soon — Season 1
        </motion.p>
      </motion.div>
    </div>
  )
}
