// .isaic format: config block, canvas WxH, [id] type at col,row [key=val...], indented body; # = comment
export function parse(text) {
  const result = { config: {}, canvas: null, components: [] }
  const lines = text.split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith('#')) { i++; continue }

    if (trimmed === 'config') {
      const { data, next } = readBlock(lines, i + 1)
      result.config = parseConfig(data)
      i = next
      continue
    }
    const canvasM = trimmed.match(/^canvas\s+(\d+)\s*x\s*(\d+)$/i)
    if (canvasM) {
      result.canvas = { width: +canvasM[1], height: +canvasM[2] }
      i++
      continue
    }
    const compM = trimmed.match(
      /^\[(\w+)\]\s+(\w+)\s+at\s+(\d+),(\d+)(?:\s+size\s+(\d+)(?:,(\d+))?)?(.*)$/,
    )
    if (compM) {
      const [, id, type, col, row, w, h, rest] = compM
      const { data: content, next } = readBlock(lines, i + 1)
      result.components.push({
        id, type,
        col: +col, row: +row,
        width:  w ? +w : undefined,
        height: h ? +h : undefined,
        attrs: parseAttrs(rest ?? ''),
        content,
      })
      i = next
      continue
    }
    i++
  }

  return result
}

function readBlock(lines, start) {
  const data = []
  let i = start
  let base = null  

  while (i < lines.length) {
    const raw = lines[i]
    const trimmed = raw.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      if (base !== null) data.push('')  
      i++
      continue
    }

    const indent = raw.length - raw.trimStart().length
    if (indent === 0) break              // back to root level — end of block

    if (base === null) base = indent
    const rel = Math.max(0, indent - base)
    data.push(' '.repeat(rel) + raw.trimStart())
    i++
  }

  // Strip trailing blank lines
  while (data.length && !data[data.length - 1]) data.pop()
  return { data, next: i }
}

// "key value" at top level; bare "key" opens a nested block
function parseConfig(lines) {
  const config = {}
  let nestedKey = null

  for (const line of lines) {
    if (!line.trim()) continue
    const indent = line.length - line.trimStart().length
    const trimmed = line.trimStart()

    if (indent === 0) {
      const spaceIdx = trimmed.search(/\s/)
      if (spaceIdx === -1) {
        nestedKey = trimmed
        config[nestedKey] = {}
      } else {
        nestedKey = null
        const key = trimmed.slice(0, spaceIdx)
        config[key] = trimmed.slice(spaceIdx).trim()
      }
    } else if (nestedKey) {
      const spaceIdx = trimmed.search(/\s/)
      if (spaceIdx !== -1) {
        config[nestedKey][trimmed.slice(0, spaceIdx)] = trimmed.slice(spaceIdx).trim()
      }
    }
  }

  return config
}

// key=value pairs and bare boolean flags from a header's trailing string
function parseAttrs(str) {
  const attrs = {}
  // quoted values first — avoid flag-matching key names
  str = str.replace(
    /(\w[\w-]*)=(?:"([^"]*)"|'([^']*)'|(\S+))/g,
    (_, key, v1, v2, v3) => { attrs[key] = v1 ?? v2 ?? v3; return '' },
  )
  // Remaining words are boolean flags (e.g. `double`)
  for (const flag of str.trim().split(/\s+/).filter(Boolean)) {
    if (/^\w[\w-]*$/.test(flag)) attrs[flag] = true
  }
  return attrs
}
