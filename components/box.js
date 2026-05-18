import { box } from '../core/render.js'
import { config } from '../core/config.js'

export default class IsaicBox extends HTMLElement {
  connectedCallback() {
    const title = this.getAttribute('title') ?? ''
    const charStyle = this.getAttribute('char-style') ?? config.charStyle
    const width = this.hasAttribute('width') ? parseInt(this.getAttribute('width')) : undefined

    const lines = this.textContent.split('\n').map(l => l.trim())
    while (lines.length && !lines[0]) lines.shift()
    while (lines.length && !lines[lines.length - 1]) lines.pop()
    if (!lines.length) lines.push('')

    const pre = document.createElement('pre')
    pre.innerHTML = box({ lines, title, width, charStyle })
    this.replaceChildren(pre)
  }
}
