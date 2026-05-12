import { badge } from '../core/render.js'

export default class IsaicBadge extends HTMLElement {
  connectedCallback() {
    this.textContent = badge(this.getAttribute('label') ?? '')
  }
}
