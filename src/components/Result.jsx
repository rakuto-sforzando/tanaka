import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { RECOMMENDATIONS, pickRecommendation } from '../data'
import Burst from './Burst'

const MAX = 120

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
const KIND = { place: '場所', book: '本', tech: '富士通の技術' }

const list = { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } } }
const item = { hidden: { opacity: 0, y: 24, scale: 0.95 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 26 } } }

export default function Result({ counts, onRestart, onBack }) {
  const [sent, setSent] = useState(false)
  const [sheet, setSheet] = useState(false)
  const [comment, setComment] = useState('')
  const [attr, setAttr] = useState('')
  const [saved, setSaved] = useState(null)
  const [error, setError] = useState('')
  const textRef = useRef(null)
  const openerRef = useRef(null)

  const recos = ['place', 'book', 'tech'].map((k) => ({ kind: k, ...pickRecommendation(RECOMMENDATIONS[k], counts) }))
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
  const topLabel = { unknown: '「わからない」', more: '「もっと知りたい」', hmm: '「ふーん」', maybe: '「わかるかも」' }[top?.[0]]

  useEffect(() => {
    if (sheet) textRef.current?.focus()
    else openerRef.current?.focus()
  }, [sheet])

  function close() { setSheet(false); setError('') }

  return (
    <motion.section className="result" variants={list} initial="hidden" animate="show" onKeyDown={(e) => { if (e.key === 'Escape' && sheet) close() }}>
      <motion.button variants={item} className="back" onClick={onBack} aria-label="最後のカードに戻る">← 最後の1枚に戻る</motion.button>
      <motion.h1 variants={item}>あなたにはコレがおすすめ！</motion.h1>
      {topLabel && <motion.p variants={item} className="lead">{topLabel}が多かったあなたへ。まず1つ、見に行ってみませんか。</motion.p>}
      {recos.map((r) => (
        <motion.div className="reco" key={r.kind} variants={item}>
          {ICONS[r.kind]}
          <div>
            <small>{KIND[r.kind]}</small>
            <h2>{r.title}</h2>
            <p>{r.desc}</p>
          </div>
        </motion.div>
      ))}
      <motion.div className="actions" variants={item}>
        <button className={`btn ${sent ? 'btn--done' : ''}`} onClick={() => setSent(true)} disabled={sent} aria-live="polite">
          {sent && <Burst />}
          {sent ? '✓ 送信しました' : '結果を送信する'}
        </button>
        {sent && <p className="note">あなたの反応は、まちの意見づくりに使われます。</p>}
        <button ref={openerRef} className="btn" onClick={() => setSheet(true)}>
          {saved ? 'コメントを書き直す' : '私も一言コメントする'}
        </button>
        {saved && (
          <p className="note" aria-live="polite">
            ✓ 一言を残しました: 「{saved.text}」{saved.attr && ` (${saved.attr})`}
            <button className="link" onClick={() => { setSaved(null); setComment(''); setAttr('') }}>取り消す</button>
          </p>
        )}
        <button className="btn btn--ghost" onClick={onRestart}>もう一回する</button>
      </motion.div>

      <AnimatePresence>
        {sheet && (
          <>
            <motion.div key="bg" className="sheet-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} />
            <motion.form
              key="sheet"
              className="sheet"
              role="dialog"
              aria-modal="true"
              aria-labelledby="sheet-title"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              onSubmit={(e) => {
                e.preventDefault()
                if (!comment.trim()) { setError('一言を入力してください'); textRef.current?.focus(); return }
                setSaved({ text: comment.trim(), attr: attr.trim() })
                close()
              }}
            >
              <div className="sheet__top">
                <h2 id="sheet-title">私も一言</h2>
                <button type="button" className="close" onClick={close} aria-label="閉じる">×</button>
              </div>
              <textarea ref={textRef} value={comment} maxLength={MAX} onChange={(e) => { setComment(e.target.value); setError('') }} placeholder="読んで思ったことを、そのまま" aria-label="コメント" aria-invalid={!!error} aria-describedby="comment-help" />
              <div id="comment-help" className="help">
                {error ? <span className="error" role="alert">{error}</span> : <span>Escで閉じる</span>}
                <span>{comment.length}/{MAX}</span>
              </div>
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
