import { tree } from '../core/render.js'
import { config } from '../core/config.js'

export class IsaicNode extends HTMLElement {}

export default class IsaicTree extends HTMLElement {
  connectedCallback() {
    const label = this.getAttribute('label') ?? ''
    const charStyle = this.getAttribute('char-style') ?? config.charStyle
    const nodes = Array.from(this.children)
    const pre = document.createElement('pre')
    pre.textContent = tree(label, nodes, charStyle)
    this.replaceChildren(pre)
  }
}
