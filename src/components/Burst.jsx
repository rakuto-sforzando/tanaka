const COLORS = ['#fe5064', '#8eb539', '#3e9be7', '#f5ce50']

// いいねの粒子。key を変えて再マウントすると再生される。
export default function Burst() {
  return (
    <div className="burst" aria-hidden="true">
      <div className="burst__ring" />
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          className="burst__dot"
          style={{ '--r': `${i * 36}deg`, '--d': `${(i % 3) * 0.08}s`, '--c': COLORS[i % 4] }}
        />
      ))}
    </div>
  )
}
