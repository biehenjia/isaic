// char count === display width for ASCII and most single-width Unicode
export function measureLines(text) {
  const lines = text.split('\n')
  return {
    lineCount: lines.length,
    maxWidth: Math.max(...lines.map(l => l.length)),
  }
}
