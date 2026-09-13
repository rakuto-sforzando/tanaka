import { motion, useMotionValue, useTransform } from 'motion/react'
import { REACTIONS } from '../data'

const THRESHOLD = 90

// ドラッグの向きから四隅のどれかを返す。
export function cornerFromOffset({ x, y }) {
  if (Math.hypot(x, y) < THRESHOLD) return null
  const vertical = y < 0 ? 't' : 'b'
  const horizontal = x < 0 ? 'l' : 'r'
  return vertical + horizontal
}

export const CORNER_VECTOR = { tl: [-1, -1], tr: [1, -1], bl: [-1, 1], br: [1, 1] }

export default function SwipeCard({ voice, onHover, onCommit }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-15, 15])
  const glow = useTransform([x, y], ([dx, dy]) => {
    const c = cornerFromOffset({ x: dx, y: dy })
    if (!c) return 'transparent'
    return REACTIONS.find((r) => r.corner === c).color
  })
  const glowOpacity = useTransform([x, y], ([dx, dy]) => Math.min(Math.hypot(dx, dy) / 200, 0.35))

  return (
    <motion.article
      className="card"
      drag
      dragSnapToOrigin
      dragElastic={0.9}
      whileDrag={{ scale: 1.03 }}
      style={{ x, y, rotate }}
      onDrag={(_, info) => onHover(cornerFromOffset(info.offset))}
      onDragEnd={(_, info) => {
        const c = cornerFromOffset(info.offset)
        onHover(null)
        if (c) onCommit(c)
      }}
      aria-label={`${voice.text}${voice.attr ? `。${voice.attr}` : ''}`}
    >
      <motion.div className="card__hint" style={{ backgroundColor: glow, opacity: glowOpacity }} />
      <p className="card__text">{voice.text}</p>
      <p className="card__attr">{voice.attr ?? ' '}</p>
    </motion.article>
  )
}
