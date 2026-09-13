import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { REACTIONS, VOICES, shuffle } from './data'
import SwipeCard, { CORNER_VECTOR } from './components/SwipeCard'
import Result from './components/Result'

const flyOut = {
  exit: (corner) => {
    const [dx, dy] = CORNER_VECTOR[corner] ?? [0, -1]
    return { x: dx * 600, y: dy * 500, rotate: dx * 30, opacity: 0, transition: { duration: 0.45, ease: [0.7, 0.01, 0.23, 1] } }
  },
}

export default function App() {
  const [deck, setDeck] = useState(() => shuffle(VOICES))
  const [index, setIndex] = useState(0)
  const [counts, setCounts] = useState({})
  const [hover, setHover] = useState(null)
  const [lastCorner, setLastCorner] = useState('tr')
  const [wipe, setWipe] = useState(0)

  const finished = index >= deck.length

  function commit(corner) {
    const r = REACTIONS.find((x) => x.corner === corner)
    setLastCorner(corner)
    setHover(corner)
    setCounts((c) => ({ ...c, [r.id]: (c[r.id] ?? 0) + 1 }))
    setTimeout(() => setHover(null), 250)
    if (index + 1 >= deck.length) setWipe((w) => w + 1)
    setIndex((i) => i + 1)
  }

  function restart() {
    setWipe((w) => w + 1)
    setDeck(shuffle(VOICES))
    setIndex(0)
    setCounts({})
  }

  useEffect(() => {
    if (finished) return
    function onKey(e) {
      const r = REACTIONS.find((x) => x.key === e.key)
      if (r) {
        e.preventDefault()
        commit(r.corner)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <main className="phone">
      {wipe > 0 && <div className="wipe" key={wipe} aria-hidden="true" />}
      {finished ? (
        <Result counts={counts} onRestart={restart} />
      ) : (
        <div className="deck">
          {REACTIONS.map((r) => (
            <button
              key={r.id}
              className={`corner corner--${r.corner} ${hover === r.corner ? 'is-active' : ''}`}
              style={{ '--corner': r.color }}
              onClick={() => commit(r.corner)}
              aria-label={`${r.label} (${r.key.replace('Arrow', '')}キー)`}
            >
              <span>{r.label}</span>
              <span className="corner__emoji">{r.emoji}</span>
            </button>
          ))}
          <AnimatePresence custom={lastCorner}>
            <motion.div key={deck[index].id} custom={lastCorner} variants={flyOut} exit="exit" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 380, damping: 24 } }} className="card-slot">
              <SwipeCard voice={deck[index]} onHover={setHover} onCommit={commit} />
            </motion.div>
          </AnimatePresence>
          <div className="deck__count" aria-live="polite">{index + 1}/{deck.length}</div>
        </div>
      )}
    </main>
  )
}
