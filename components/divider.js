import { divider } from '../core/render.js'
import { config } from '../core/config.js'

export default class IsaicDivider extends HTMLElement {
  connectedCallback() {
    const width = parseInt(this.getAttribute('width') ?? '40')
    const charStyle = this.getAttribute('char-style') ?? config.charStyle
    const double = this.hasAttribute('double')

    const pre = document.createElement('pre')
    pre.textContent = divider({ width, charStyle, double })
    this.replaceChildren(pre)
  }
}
