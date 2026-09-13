import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { REACTIONS, VOICES, shuffle } from './data'
import SwipeCard, { CORNER_VECTOR } from './components/SwipeCard'
import Result from './components/Result'

const HINT_KEY = 'ftp-tanaka-hint-seen'
const isTouch = matchMedia('(pointer: coarse)').matches

// 進むときは答えた隅へ飛んでいき、戻るときは飛んでいった隅から元の位置へ帰ってくる。
const fly = (corner) => {
  const [dx, dy] = CORNER_VECTOR[corner] ?? [0, -1]
  return { x: dx * 600, y: dy * 500, rotate: dx * 30, opacity: 0 }
}
const cardMotion = {
  initial: ({ corner, back }) => (back ? fly(corner) : { scale: 0.9, opacity: 0, x: 0, y: 0, rotate: 0 }),
  animate: ({ back }) => ({ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, transition: back ? { duration: 0.45, ease: [0.7, 0.01, 0.23, 1] } : { type: 'spring', stiffness: 380, damping: 24 } }),
  exit: ({ corner, back }) => (back
    ? { scale: 0.9, opacity: 0, transition: { duration: 0.2 } }
    : { ...fly(corner), transition: { duration: 0.45, ease: [0.7, 0.01, 0.23, 1] } }),
}

function readHint() {
  try { return !localStorage.getItem(HINT_KEY) } catch { return true }
}

export default function App() {
  const [deck, setDeck] = useState(() => shuffle(VOICES))
  const [index, setIndex] = useState(0)
  const [history, setHistory] = useState([]) // 取り消し用: 直前の反応
  const [hover, setHover] = useState(null)
  const [motionInfo, setMotionInfo] = useState({ corner: 'tr', back: false })
  const [wipe, setWipe] = useState(0)
  const [showHint, setShowHint] = useState(readHint)
  const [status, setStatus] = useState('')

  const finished = index >= deck.length
  const counts = history.reduce((c, h) => ({ ...c, [h.id]: (c[h.id] ?? 0) + 1 }), {})

  function dismissHint() {
    if (!showHint) return
    setShowHint(false)
    try { localStorage.setItem(HINT_KEY, '1') } catch { /* 保存できなくても進める */ }
  }

  function commit(corner) {
    const r = REACTIONS.find((x) => x.corner === corner)
    dismissHint()
    setMotionInfo({ corner, back: false })
    setHover(corner)
    setHistory((h) => [...h, { id: r.id, label: r.label, corner }])
    setStatus(`${r.label} と答えました`)
    setTimeout(() => setHover(null), 250)
    if (index + 1 >= deck.length) setWipe((w) => w + 1)
    setIndex((i) => i + 1)
  }

  function undo() {
    if (history.length === 0) return
    setMotionInfo({ corner: history.at(-1).corner, back: true })
    setHistory((h) => h.slice(0, -1))
    setIndex((i) => i - 1)
    setStatus('1枚戻しました')
  }

  function restart() {
    setWipe((w) => w + 1)
    setDeck(shuffle(VOICES))
    setIndex(0)
    setHistory([])
    setStatus('')
  }

  useEffect(() => {
    if (finished) return
    function onKey(e) {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return
      const r = REACTIONS.find((x) => x.key === e.key)
      if (r) { e.preventDefault(); commit(r.corner) }
      if (e.key === 'Backspace' || e.key === 'z') { e.preventDefault(); undo() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <main className="phone">
      {wipe > 0 && <div className="wipe" key={wipe} aria-hidden="true" />}
      <p className="sr-only" aria-live="polite">{status}</p>

      {finished ? (
        <Result counts={counts} onRestart={restart} onBack={undo} />
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
              {!isTouch && <kbd className="corner__key" aria-hidden="true">{{ ArrowLeft: '←', ArrowUp: '↑', ArrowDown: '↓', ArrowRight: '→' }[r.key]}</kbd>}
            </button>
          ))}

          <AnimatePresence custom={motionInfo}>
            <motion.div key={deck[index].id} custom={motionInfo} variants={cardMotion} initial="initial" animate="animate" exit="exit" className="card-slot">
              <SwipeCard voice={deck[index]} onHover={(c) => { if (c) dismissHint(); setHover(c) }} onCommit={commit} />
            </motion.div>
          </AnimatePresence>

          {showHint && (
            <div className="hint" role="note">
              <span className="hint__arrow" aria-hidden="true">↖ ↗<br />↙ ↘</span>
              カードを四隅へ動かすか、角のボタンで答えます
              <button className="hint__close" onClick={dismissHint} aria-label="ヒントを閉じる">×</button>
            </div>
          )}

          <div className="progress" aria-label={`${index + 1}枚目 / ${deck.length}枚`}>
            {deck.map((v, i) => <i key={v.id} className={i < index ? 'is-done' : i === index ? 'is-now' : ''} />)}
          </div>
          <button className="undo" onClick={undo} disabled={history.length === 0} aria-label="ひとつ前のカードに戻る">
            ↩ 戻る{history.length > 0 && <small>{history.at(-1).label}</small>}
          </button>
        </div>
      )}
    </main>
  )
}
