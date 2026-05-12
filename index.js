import { parse }   from './core/parser.js'
import { mount }   from './core/layout.js'
import IsaicBox    from './components/box.js'
import IsaicTree, { IsaicNode } from './components/tree.js'
import IsaicBadge  from './components/badge.js'
import IsaicDivider from './components/divider.js'

// data-config: load and mount a .isaic site; otherwise register web components
const configPath = document.querySelector('script[data-config]')?.getAttribute('data-config')

if (configPath) {
  fetch(configPath)
    .then(r => { if (!r.ok) throw new Error(r.statusText); return r.text() })
    .then(text => mount(parse(text), document.body))
    .catch(err => console.error('isaic: failed to load config —', err))
} else {
  // inner before outer: badge/divider must render before tree/box reads textContent
  customElements.define('isaic-node',    IsaicNode)
  customElements.define('isaic-badge',   IsaicBadge)
  customElements.define('isaic-divider', IsaicDivider)
  customElements.define('isaic-tree',    IsaicTree)
  customElements.define('isaic-box',     IsaicBox)
}
