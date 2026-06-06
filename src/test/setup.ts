import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock matchMedia for tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
class ResizeObserverMock {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
window.ResizeObserver = ResizeObserverMock

// Mock IntersectionObserver
class IntersectionObserverMock {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  root = null
  rootMargin = ''
  thresholds = []
}
window.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver

// Mock canvas context
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  fillText: vi.fn(),
  measureText: vi.fn().mockReturnValue({ width: 100 }),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  scale: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  createLinearGradient: vi.fn().mockReturnValue({
    addColorStop: vi.fn(),
  }),
  createRadialGradient: vi.fn().mockReturnValue({
    addColorStop: vi.fn(),
  }),
})

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((callback) => {
  return setTimeout(callback, 16) as unknown as number
})

global.cancelAnimationFrame = vi.fn((id) => {
  clearTimeout(id)
})

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn()

// Mock MediaRecorder
class MediaRecorderMock {
  state = 'inactive'
  ondataavailable: ((event: { data: Blob }) => void) | null = null
  onstop: (() => void) | null = null
  onerror: (() => void) | null = null

  start = vi.fn(() => {
    this.state = 'recording'
  })
  stop = vi.fn(() => {
    this.state = 'inactive'
    if (this.onstop) this.onstop()
  })
  pause = vi.fn()
  resume = vi.fn()

  static isTypeSupported = vi.fn().mockReturnValue(true)
}
window.MediaRecorder = MediaRecorderMock as unknown as typeof MediaRecorder

// Mock captureStream
HTMLCanvasElement.prototype.captureStream = vi.fn().mockReturnValue({
  getTracks: vi.fn().mockReturnValue([]),
  addTrack: vi.fn(),
  removeTrack: vi.fn(),
})

// Mock Web Speech API (text-to-speech) for bimodal reading tests
class SpeechSynthesisUtteranceMock {
  text = ''
  lang = ''
  voice: unknown = null
  rate = 1
  pitch = 1
  volume = 1
  onstart: null | (() => void) = null
  onend: null | (() => void) = null
  onerror: null | ((e: unknown) => void) = null
  onboundary: null | ((e: { name: string; charIndex: number; charLength?: number }) => void) = null
  constructor(text?: string) {
    if (text) this.text = text
  }
}

const _voices = [
  { voiceURI: 'en-US-1', name: 'Test English', lang: 'en-US', default: true, localService: true },
  { voiceURI: 'en-GB-1', name: 'Test British', lang: 'en-GB', default: false, localService: false },
]

const speechSynthesisMock = {
  speak: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  getVoices: vi.fn(() => _voices),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  speaking: false,
  paused: false,
  pending: false,
}

vi.stubGlobal('speechSynthesis', speechSynthesisMock)
vi.stubGlobal(
  'SpeechSynthesisUtterance',
  SpeechSynthesisUtteranceMock as unknown as typeof SpeechSynthesisUtterance,
)
