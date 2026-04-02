import { prepare, layout } from '@chenglou/pretext'
import { messages as TEMPLATES } from './messages.js'

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL        = 1000
const FONT         = '16px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
const LINE_HEIGHT  = 24   // 16px × 1.5
const BUBBLE_PAD_V = 24   // 12px top + 12px bottom
const BUBBLE_PAD_H = 32   // 16px left + 16px right
const ROW_PAD_H    = 24   // 12px left + 12px right on each msg-row
const MAX_W_RATIO  = 0.70
const OVERSCAN     = 3
const GAP_SAME     = 8    // px between messages from the same sender
const GAP_DIFF     = 16   // px between messages from different senders

// ─── Data ─────────────────────────────────────────────────────────────────────

const allMessages = Array.from({ length: TOTAL }, (_, i) => TEMPLATES[i % TEMPLATES.length])

// ─── DOM refs ─────────────────────────────────────────────────────────────────

const chatScroll = document.getElementById('chat-scroll')
const chatInner  = document.getElementById('chat-inner')

// ─── Positions ────────────────────────────────────────────────────────────────

let positions = []  // { top, height } per message

function buildPositions(containerWidth) {
  // max-width: 70% is relative to the row's content width (row width − row padding)
  const rowContentW  = containerWidth - ROW_PAD_H
  const bubbleMaxW   = rowContentW * MAX_W_RATIO
  const textMaxW     = bubbleMaxW - BUBBLE_PAD_H

  // Pretext: one-time expensive prepare(), then cheap layout() per item
  const prepared = allMessages.map(msg => prepare(msg.text, FONT))

  positions = []
  let top = 0

  for (let i = 0; i < allMessages.length; i++) {
    if (i > 0) {
      top += allMessages[i].sender !== allMessages[i - 1].sender ? GAP_DIFF : GAP_SAME
    }
    const { height: textH } = layout(prepared[i], textMaxW, LINE_HEIGHT)
    const h = textH + BUBBLE_PAD_V
    positions.push({ top, height: h })
    top += h
  }

  return top // totalHeight
}

// ─── Virtual rendering ────────────────────────────────────────────────────────

const renderedItems = new Map() // index → DOM element

function getVisibleRange() {
  const scrollTop  = chatScroll.scrollTop
  const viewportH  = chatScroll.clientHeight

  // Binary search: first item whose bottom edge is ≥ scrollTop
  let lo = 0, hi = allMessages.length - 1
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (positions[mid].top + positions[mid].height < scrollTop) lo = mid + 1
    else hi = mid
  }

  const start = Math.max(0, lo - OVERSCAN)

  // Walk forward to find last visible item
  let end = lo
  while (end < allMessages.length - 1 && positions[end].top < scrollTop + viewportH) end++
  end = Math.min(allMessages.length - 1, end + OVERSCAN)

  return [start, end]
}

function createMessageEl(i) {
  const msg = allMessages[i]
  const pos = positions[i]

  const row = document.createElement('div')
  row.className = `msg-row msg-${msg.sender}`
  row.style.cssText = `position:absolute;top:${pos.top}px;left:0;right:0;`

  if (msg.sender === 'other') {
    const av = document.createElement('div')
    av.className = 'avatar'
    row.appendChild(av)
  }

  const bubble = document.createElement('div')
  bubble.className = 'bubble'
  bubble.textContent = msg.text
  row.appendChild(bubble)

  return row
}

function render() {
  const [start, end] = getVisibleRange()

  // Remove items that scrolled out of range
  for (const [idx, el] of renderedItems) {
    if (idx < start || idx > end) {
      el.remove()
      renderedItems.delete(idx)
    }
  }

  // Mount newly visible items
  for (let i = start; i <= end; i++) {
    if (!renderedItems.has(i)) {
      const el = createMessageEl(i)
      chatInner.appendChild(el)
      renderedItems.set(i, el)
    }
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────

function init() {
  const totalHeight = buildPositions(chatScroll.clientWidth)
  chatInner.style.height = totalHeight + 'px'

  // Start at the bottom, like a real chat app
  chatScroll.scrollTop = chatScroll.scrollHeight

  render()

  let raf = null
  chatScroll.addEventListener('scroll', () => {
    if (raf) cancelAnimationFrame(raf)
    raf = requestAnimationFrame(() => { render(); raf = null })
  }, { passive: true })
}

document.addEventListener('DOMContentLoaded', init)
