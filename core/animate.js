const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function animate(el, motion, attrs = {}) {
  if (REDUCED) return Promise.resolve()
  const delay = parseInt(attrs.delay ?? '0') || 0
  const speed = parseInt(attrs.speed ?? '3') || 3

  switch (motion) {
    case 'typewriter': return withDelay(delay, () => typewriter(el, speed))
    case 'fadein':     return fadein(el, delay)
    case 'blink':      blink(el); return Promise.resolve()
    default:           return Promise.resolve()
  }
}

// sequential boot reveal; delay= adds a pause after each item finishes
export async function runBootSequence(items) {
  if (REDUCED) {
    items.forEach(({ el }) => show(el))
    return
  }
  for (const { el, delay, speed } of items) {
    if (delay) await sleep(delay)
    show(el)
    await typewriter(el, speed)
  }
}

// ── animation implementations ────────────────────────────────────────────────

function typewriter(el, speed = 3) {
  return new Promise(resolve => {
    const pre = el.querySelector('pre') ?? el
    const fullHtml = pre.innerHTML
    // spread into array so multi-byte unicode chars (box drawing) count as one
    const chars = [...pre.textContent]
    if (!chars.length) { resolve(); return }

    pre.textContent = ''
    let pos = 0
    let buf  = ''

    const tick = () => {
      if (pos >= chars.length) {
        pre.innerHTML = fullHtml  // restore <a> links now that animation is done
        resolve()
        return
      }

      buf += chars[pos++]
      pre.textContent = buf

      // brief pause after sentence-end at a line break
      const ch   = chars[pos - 1]
      const next = chars[pos] ?? ''
      const extra = /[.!?]/.test(ch) && next === '\n' ? 80 : 0

      setTimeout(tick, speed + extra)
    }

    tick()
  })
}

function fadein(el, delay) {
  return new Promise(resolve => {
    el.style.opacity    = '0'
    el.style.transition = `opacity 600ms ease ${delay}ms`
    // Double rAF ensures opacity:0 is committed before the transition begins
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.opacity = '1'
      el.addEventListener('transitionend', resolve, { once: true })
    }))
  })
}

function blink(el) {
  el.style.animation = 'blink 1s step-end infinite'
}

// ── helpers ──────────────────────────────────────────────────────────────────

const show  = el => { el.style.visibility = 'visible' }
const sleep = ms  => new Promise(r => setTimeout(r, ms))
const withDelay = (ms, fn) => ms ? new Promise(r => setTimeout(() => fn().then(r), ms)) : fn()
