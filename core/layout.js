import { box, tree, divider, processLine } from './render.js'
import { config as globalConfig } from './config.js'
import { animate, runBootSequence } from './animate.js'

const mkPre = () => document.createElement('pre')

export function mount(parsed, container) {
  applyConfig(parsed.config)

  const canvas = document.createElement('div')
  canvas.className = 'isaic-canvas'
  if (parsed.canvas) {
    canvas.style.width = `${parsed.canvas.width}ch`
    canvas.style.height = `${parsed.canvas.height}lh`
  }
  container.appendChild(canvas)

  const bootItems = []

  for (const comp of parsed.components) {
    const el = renderComponent(comp)
    if (!el) continue
    el.id = comp.id
    el.classList.add('isaic-component', `isaic-type-${comp.type}`)
    el.style.position = 'absolute'
    el.style.left = `${comp.col}ch`
    el.style.top = `${comp.row}lh`
    if (comp.width != null) el.style.width = `${comp.width}ch`

    const motion = comp.attrs.motion
    const delay = parseInt(comp.attrs.delay ?? '0') || 0
    const speed = parseInt(comp.attrs.speed ?? globalConfig.speed) || 3

    if (motion === 'boot') {
      el.style.visibility = 'hidden'
      bootItems.push({ el, delay, speed })
    } else if (motion) {
      animate(el, motion, comp.attrs)
    }

    canvas.appendChild(el)
  }

  if (bootItems.length) runBootSequence(bootItems)
}

function applyConfig(cfg) {
  if (cfg.charStyle) globalConfig.charStyle = cfg.charStyle
  if (cfg.speed) globalConfig.speed = parseInt(cfg.speed) || 3

  const root = document.documentElement
  if (cfg.theme) applyTheme(cfg.theme, root)
  if (cfg.font) root.style.setProperty('--font', cfg.font)
  if (cfg.colors) {
    for (const [k, v] of Object.entries(cfg.colors)) {
      root.style.setProperty(`--${k}`, v)
    }
  }
}

function applyTheme(name, root) {
  import('./themes.js').then(({ themes }) => {
    const t = themes[name]
    if (!t) { console.warn(`isaic: unknown theme "${name}"`); return }
    for (const [k, v] of Object.entries(t)) root.style.setProperty(`--${k}`, v)
  })
}

function renderComponent(comp) {
  const charStyle = comp.attrs['char-style'] ?? globalConfig.charStyle
  switch (comp.type) {
    case 'box': return renderBox(comp, charStyle)
    case 'tree': return renderTree(comp, charStyle)
    case 'text': return renderText(comp)
    case 'divider': return renderDivider(comp, charStyle)
    case 'html': return renderHtml(comp)
    default:
      console.warn(`isaic: unknown component type "${comp.type}"`)
      return null
  }
}

function renderBox(comp, charStyle) {
  const pre = mkPre()
  pre.innerHTML = box({
    lines: comp.content,
    title: comp.attrs.title ?? '',
    width: comp.width,
    charStyle,
  })
  return pre
}

function renderTree(comp, charStyle) {
  const nodes = parseTreeContent(comp.content)
  const pre = mkPre()
  pre.textContent = tree(comp.attrs.label ?? '', nodes, charStyle)
  return pre
}

function renderText(comp) {
  const pre = mkPre()
  pre.innerHTML = comp.content.map(processLine).join('\n')
  return pre
}

function renderDivider(comp, charStyle) {
  const pre = mkPre()
  pre.textContent = divider({
    width: comp.width ?? 40,
    charStyle,
    double: comp.attrs.double === true,
  })
  return pre
}

function renderHtml(comp) {
  const div = document.createElement('div')
  div.className = 'isaic-html-block'
  div.innerHTML = comp.content.join('\n')
  return div
}

function parseTreeContent(lines) {
  const root  = []
  const stack = [{ children: root, indent: -2 }]

  for (const line of lines) {
    if (!line.trim()) continue
    const indent = line.length - line.trimStart().length
    const node   = { label: line.trim(), children: [] }

    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop()
    }
    stack[stack.length - 1].children.push(node)
    stack.push({ ...node, indent })
  }

  return root
}
