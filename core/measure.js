let _ctx = null
let _charPx = null
let _font = null

function getCtx() {
  if (!_ctx) _ctx = document.createElement('canvas').getContext('2d')
  return _ctx
}

function syncFont() {
  const family = getComputedStyle(document.documentElement).getPropertyValue('--font').trim() || 'monospace'
  const full = `16px ${family}`
  if (full === _font) return
  const ctx = getCtx()
  ctx.font = full
  _font = full
  // use a box-drawing char as the reference so it matches the actual content
  _charPx = ctx.measureText('─').width
}

export function textWidth(str) {
  if (!str) return 0
  syncFont()
  return Math.round(getCtx().measureText(str).width / _charPx)
}

export function measureLines(text) {
  const lines = text.split('\n')
  return {
    lineCount: lines.length,
    maxWidth: Math.max(...lines.map(textWidth)),
  }
}
