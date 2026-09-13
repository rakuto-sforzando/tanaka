// 架空のサンプル。実在の発言ではない。
export const REACTIONS = [
  { id: 'unknown', label: 'わからない', emoji: '🤔', corner: 'tl', key: 'ArrowLeft', color: '#8eb539' },
  { id: 'more', label: 'もっと知りたい', emoji: '🤩', corner: 'tr', key: 'ArrowUp', color: '#3e9be7' },
  { id: 'hmm', label: 'ふーん', emoji: '🙂', corner: 'bl', key: 'ArrowDown', color: '#f5ce50' },
  { id: 'maybe', label: 'わかるかも', emoji: '🙂', corner: 'br', key: 'ArrowRight', color: '#fe587a' },
]

export const VOICES = [
  { id: 'v1', text: '雨の日は、屋根のある道が入口までつながっていると助かる。', attr: '車いすユーザー' },
  { id: 'v2', text: '館内放送は、文字でも同時に出してほしい。', attr: '聴覚障害 (難聴)' },
  { id: 'v3', text: '広い場所ほど、どこに何があるか音で教えてほしい。', attr: '視覚障害' },
  { id: 'v4', text: '人が多いと疲れるので、少し暗くて静かな部屋が近くにあると安心。', attr: '感覚過敏' },
  { id: 'v5', text: 'トイレの案内は、性別で分けない選択肢もほしい。', attr: null },
  { id: 'v6', text: 'ベビーカーのまま座れる観客席があるとうれしい。', attr: '子育て中' },
  { id: 'v7', text: '案内表示の日本語は、短くてやさしい言葉だと読みやすい。', attr: '外国出身' },
  { id: 'v8', text: '座って休める場所が、歩く途中に何度もあるといい。', attr: '高齢者' },
]

// 反応の傾向ごとに 1 件ずつ選ぶ。すべて架空。
export const RECOMMENDATIONS = {
  place: [
    { for: 'more', title: '空港の静かな待合室', desc: '刺激を抑えた部屋。実際に置かれている例を見に行ける。' },
    { for: 'unknown', title: 'まちの体験型展示室', desc: '触って確かめられる案内表示や床の展示。' },
    { for: 'default', title: 'FTPの広場 (模型)', desc: '段差のない動線を模型で確かめられる。' },
  ],
  book: [
    { for: 'maybe', title: '『わかるとは何か』(架空)', desc: '共感と理解のちがいをめぐる随筆。' },
    { for: 'unknown', title: '『はじめての手話』(架空)', desc: '知らないことを、まず眺めてみるための入門。' },
    { for: 'default', title: '『まちの声を聞く』(架空)', desc: '意見を集めて建物に反映した記録。' },
  ],
  tech: [
    { for: 'more', title: '音の見える化', desc: '周囲の音を文字や図にして表示する技術。' },
    { for: 'hmm', title: '人の流れの分析', desc: '混雑を見つけて静かな場所へ案内する。' },
    { for: 'default', title: '触れる地図', desc: '指でなぞって全体を知る案内板。' },
  ],
}

export function pickRecommendation(list, counts) {
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0]
  return list.find((r) => r.for === top) ?? list.find((r) => r.for === 'default')
}

export function shuffle(list) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
