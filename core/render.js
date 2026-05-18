const CHARS = {
  unicode: { tl: '┌', tr: '┐', bl: '└', br: '┘', h: '─', v: '│' },
  ascii:   { tl: '+', tr: '+', bl: '+', br: '+', h: '-', v: '|' },
  rounded: { tl: '╭', tr: '╮', bl: '╰', br: '╯', h: '─', v: '│' },
}

const TREE_CHARS = {
  unicode: { branch: '├── ', last: '└── ', cont: '│   ', empty: '    ' },
  ascii:   { branch: '+-- ', last: '`-- ', cont: '|   ', empty: '    ' },
  rounded: { branch: '├── ', last: '╰── ', cont: '│   ', empty: '    ' },
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function renderLinks(str) {
  return str.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_, text, href) => `<a href="${escapeHtml(href)}">${text}</a>`,
  )
}

export function processLine(str) {
  return renderLinks(escapeHtml(str))
}

function visibleLen(html) {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .length
}

export function box({ lines, title = '', width, charStyle = 'unicode', padding = 1 }) {
  const c = CHARS[charStyle] ?? CHARS.unicode
  const maxLine = lines.length ? Math.max(...lines.map(l => l.length)) : 0
  const innerWidth = width != null
    ? width - 2
    : Math.max(maxLine + padding * 2, title ? title.length + 4 : 0)
  const contentWidth = Math.max(0, innerWidth - padding * 2)
  const pad = ' '.repeat(padding)

  let top
  if (title) {
    const fill = Math.max(0, innerWidth - title.length - 3)
    top = `${c.tl}${c.h} ${escapeHtml(title)} ${c.h.repeat(fill)}${c.tr}`
  } else {
    top = `${c.tl}${c.h.repeat(innerWidth)}${c.tr}`
  }

  const rows = lines.map(l => {
    const html = processLine(l)
    const trailing = ' '.repeat(Math.max(0, contentWidth - visibleLen(html)))
    return `${c.v}${pad}${html}${trailing}${pad}${c.v}`
  })
  const bottom = `${c.bl}${c.h.repeat(innerWidth)}${c.br}`

  return [top, ...rows, bottom].join('\n')
}

export function tree(rootLabel, nodes, charStyle = 'unicode') {
  const lines = rootLabel ? [`${rootLabel}/`] : []
  lines.push(...treeRows(nodes, charStyle, ''))
  return lines.join('\n')
}

function treeRows(nodes, charStyle, prefix) {
  const c = TREE_CHARS[charStyle] ?? TREE_CHARS.unicode
  const items = []
  for (const n of nodes) {
    if (n.tagName) {
      if (n.tagName === 'ISAIC-NODE') {
        items.push({ label: n.getAttribute('label') ?? '', children: Array.from(n.children) })
      }
    } else {
      items.push({ label: n.label ?? '', children: n.children ?? [] })
    }
  }
  return items.flatMap(({ label, children }, i) => {
    const isLast = i === items.length - 1
    const connector = isLast ? c.last : c.branch
    const childPrefix = prefix + (isLast ? c.empty : c.cont)
    return [
      prefix + connector + label,
      ...(children.length ? treeRows(children, charStyle, childPrefix) : []),
    ]
  })
}

export function divider({ width = 40, charStyle = 'unicode', double = false }) {
  const h = double
    ? (charStyle === 'ascii' ? '=' : '═')
    : (CHARS[charStyle]?.h ?? '─')
  return h.repeat(width)
}

export function badge(label) {
  return `[${label}]`
}
