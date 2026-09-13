import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { RECOMMENDATIONS, pickRecommendation } from '../data'
import Burst from './Burst'

const ICONS = {
  place: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  ),
  book: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4Z" />
      <path d="M20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7Z" />
    </svg>
  ),
  tech: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 3h6v4l3 8a3 3 0 0 1-3 4H9a3 3 0 0 1-3-4l3-8Z" />
      <path d="M8 13h8" />
    </svg>
  ),
}

const list = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
}
const item = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 26 } },
}

export default function Result({ counts, onRestart }) {
  const [sent, setSent] = useState(false)
  const [sheet, setSheet] = useState(false)
  const [comment, setComment] = useState('')
  const [attr, setAttr] = useState('')
  const [saved, setSaved] = useState(null)

  const recos = ['place', 'book', 'tech'].map((k) => ({ kind: k, ...pickRecommendation(RECOMMENDATIONS[k], counts) }))

  return (
    <motion.section className="result" variants={list} initial="hidden" animate="show">
      <motion.h1 variants={item}>あなたにはコレがおすすめ！</motion.h1>
      {recos.map((r) => (
        <motion.div className="reco" key={r.kind} variants={item}>
          {ICONS[r.kind]}
          <div>
            <h2>{r.title}</h2>
            <p>{r.desc}</p>
          </div>
        </motion.div>
      ))}
      <motion.div className="actions" variants={item}>
        <button className={`btn ${sent ? 'btn--done' : ''}`} onClick={() => setSent(true)} disabled={sent}>
          {sent && <Burst />}
          {sent ? '送信しました' : '結果を送信する'}
        </button>
        <button className="btn" onClick={() => setSheet(true)}>
          {saved ? 'コメントを書き直す' : '私も一言コメントする'}
        </button>
        <button className="btn" onClick={onRestart}>もう一回する</button>
        {saved && <p style={{ margin: 0, fontSize: 13, color: '#555' }}>あなたの一言: 「{saved.text}」{saved.attr && ` (${saved.attr})`}</p>}
      </motion.div>

      <AnimatePresence>
        {sheet && (
          <>
            <motion.div key="bg" className="sheet-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSheet(false)} />
            <motion.form
              key="sheet"
              className="sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              onSubmit={(e) => {
                e.preventDefault()
                if (!comment.trim()) return
                setSaved({ text: comment.trim(), attr: attr.trim() })
                setSheet(false)
              }}
            >
              <h2>私も一言</h2>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="読んで思ったことを、そのまま" aria-label="コメント" />
              <label>
                立場 (任意)
                <input type="text" value={attr} onChange={(e) => setAttr(e.target.value)} placeholder="例: 車いすユーザー" />
              </label>
              <button className="btn btn--done" type="submit">送る</button>
            </motion.form>
          </>
        )}
      </AnimatePresence>
    </motion.section>
  )
}
