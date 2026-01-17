import { describe, it, expect, beforeEach } from 'vitest'
import { useReaderStore } from './useReaderStore'

// Helper to get fresh state after mutations
const getState = () => useReaderStore.getState()

describe('useReaderStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test using setState
    useReaderStore.setState({
      inputText: '',
      tokens: [],
      currentIndex: 0,
      isPlaying: false,
      isRecording: false,
      isFullscreen: false,
      wpm: 300,
      isSidePanelOpen: false,
      isSettingsOpen: false,
      isSummaryOpen: false,
      showInput: true,
      isZenMode: false,
      summary: null,
      isGeneratingSummary: false,
      apiKey: null,
      settings: {
        chunkSize: 1,
        fontSize: 64,
        showReticle: true,
        pauseAtEndOfSentence: false,
        backgroundColor: '#1a1a1a',
        textColor: '#e5e5e5',
        highlightColor: '#ff4444',
        aspectRatio: '16:9',
        fontFamily: 'sans',
        readingMode: 'rsvp',
        smartChunking: false,
        peripheralMode: false,
        bionicReading: false,
        smartRewind: false,
        punctuationPause: false,
      },
    })
  })

  describe('text and tokenization', () => {
    it('tokenizes input text', () => {
      getState().setInputText('Hello world')

      expect(getState().tokens).toHaveLength(2)
      expect(getState().tokens[0].text).toBe('Hello')
      expect(getState().tokens[1].text).toBe('world')
    })

    it('resets index when setting new text', () => {
      getState().setInputText('Hello world')
      getState().setCurrentIndex(1)
      getState().setInputText('New text here')

      expect(getState().currentIndex).toBe(0)
    })

    it('stops playback when setting new text', () => {
      getState().setInputText('Hello world')
      getState().play()
      getState().setInputText('New text')

      expect(getState().isPlaying).toBe(false)
    })
  })

  describe('WPM controls', () => {
    it('sets WPM within valid range', () => {
      getState().setWpm(500)
      expect(getState().wpm).toBe(500)
    })

    it('clamps WPM to minimum of 100', () => {
      getState().setWpm(50)
      expect(getState().wpm).toBe(100)
    })

    it('clamps WPM to maximum of 1000', () => {
      getState().setWpm(1500)
      expect(getState().wpm).toBe(1000)
    })
  })

  describe('playback controls', () => {
    it('plays', () => {
      getState().play()
      expect(getState().isPlaying).toBe(true)
    })

    it('pauses', () => {
      getState().play()
      getState().pause()
      expect(getState().isPlaying).toBe(false)
    })

    it('toggles play state', () => {
      expect(getState().isPlaying).toBe(false)
      getState().togglePlay()
      expect(getState().isPlaying).toBe(true)
      getState().togglePlay()
      expect(getState().isPlaying).toBe(false)
    })

    it('resets to beginning', () => {
      getState().setInputText('Hello world test')
      getState().setCurrentIndex(2)
      getState().play()
      getState().reset()

      expect(getState().currentIndex).toBe(0)
      expect(getState().isPlaying).toBe(false)
    })

    it('smart rewind moves back 5 words on pause', () => {
      getState().setInputText('one two three four five six seven eight nine ten')
      getState().updateSettings({ smartRewind: true })
      getState().setCurrentIndex(7)
      getState().pause()

      expect(getState().currentIndex).toBe(2) // 7 - 5 = 2
    })

    it('smart rewind does not go below 0', () => {
      getState().setInputText('one two three')
      getState().updateSettings({ smartRewind: true })
      getState().setCurrentIndex(2)
      getState().pause()

      expect(getState().currentIndex).toBe(0)
    })
  })

  describe('skip controls', () => {
    beforeEach(() => {
      getState().setInputText('Hello world. This is a test. Another sentence here.')
    })

    it('skips forward by default 5 words', () => {
      getState().setCurrentIndex(0)
      getState().skipForward()
      expect(getState().currentIndex).toBe(5)
    })

    it('skips backward by default 5 words', () => {
      getState().setCurrentIndex(7)
      getState().skipBackward()
      expect(getState().currentIndex).toBe(2)
    })

    it('skips forward with custom count', () => {
      getState().setCurrentIndex(0)
      getState().skipForward(3)
      expect(getState().currentIndex).toBe(3)
    })

    it('does not skip past end', () => {
      const tokenCount = getState().tokens.length
      getState().setCurrentIndex(tokenCount - 2)
      getState().skipForward(10)
      expect(getState().currentIndex).toBe(tokenCount - 1)
    })

    it('does not skip before beginning', () => {
      getState().setCurrentIndex(2)
      getState().skipBackward(10)
      expect(getState().currentIndex).toBe(0)
    })

    it('skips to next sentence', () => {
      getState().setCurrentIndex(0)
      getState().skipToNextSentence()
      // Should be at start of "This"
      expect(getState().currentIndex).toBeGreaterThan(0)
    })

    it('skips to previous sentence', () => {
      getState().setCurrentIndex(5)
      getState().skipToPrevSentence()
      expect(getState().currentIndex).toBeLessThan(5)
    })
  })

  describe('settings', () => {
    it('updates single setting', () => {
      getState().updateSettings({ fontSize: 72 })
      expect(getState().settings.fontSize).toBe(72)
    })

    it('updates multiple settings', () => {
      getState().updateSettings({
        fontSize: 48,
        backgroundColor: '#000000'
      })
      expect(getState().settings.fontSize).toBe(48)
      expect(getState().settings.backgroundColor).toBe('#000000')
    })

    it('updates chunk size setting', () => {
      getState().updateSettings({ chunkSize: 2 })
      expect(getState().settings.chunkSize).toBe(2)
    })

    it('retokenizes when smart chunking changes', () => {
      getState().setInputText('Hello world, this is a test.')
      const normalTokenCount = getState().tokens.length

      getState().updateSettings({ smartChunking: true })
      // Smart chunking typically produces fewer tokens
      expect(getState().tokens.length).toBeLessThanOrEqual(normalTokenCount)
    })
  })

  describe('UI state toggles', () => {
    it('toggles side panel', () => {
      expect(getState().isSidePanelOpen).toBe(false)
      getState().toggleSidePanel()
      expect(getState().isSidePanelOpen).toBe(true)
      getState().toggleSidePanel()
      expect(getState().isSidePanelOpen).toBe(false)
    })

    it('toggles settings modal', () => {
      expect(getState().isSettingsOpen).toBe(false)
      getState().toggleSettings()
      expect(getState().isSettingsOpen).toBe(true)
    })

    it('toggles zen mode', () => {
      expect(getState().isZenMode).toBe(false)
      getState().toggleZenMode()
      expect(getState().isZenMode).toBe(true)
    })

    it('toggles summary modal', () => {
      expect(getState().isSummaryOpen).toBe(false)
      getState().toggleSummary()
      expect(getState().isSummaryOpen).toBe(true)
    })
  })

  describe('computed helpers', () => {
    beforeEach(() => {
      getState().setInputText('word '.repeat(300).trim()) // 300 words
      getState().setWpm(300)
    })

    it('calculates estimated time', () => {
      const time = getState().getEstimatedTime()
      expect(time).toBe(60) // 300 words at 300 WPM = 60 seconds
    })

    it('calculates remaining time', () => {
      getState().setCurrentIndex(150) // Halfway
      const remaining = getState().getRemainingTime()
      expect(remaining).toBe(30) // 150 words remaining at 300 WPM = 30 seconds
    })

    it('calculates progress percentage', () => {
      getState().setCurrentIndex(150) // Halfway
      const progress = getState().getProgress()
      expect(progress).toBe(50)
    })

    it('returns 0 progress for empty tokens', () => {
      getState().setInputText('')
      const progress = getState().getProgress()
      expect(progress).toBe(0)
    })
  })

  describe('summary state', () => {
    it('sets API key', () => {
      getState().setApiKey('test-key')
      expect(getState().apiKey).toBe('test-key')
    })

    it('sets summary', () => {
      getState().setSummary('This is a summary')
      expect(getState().summary).toBe('This is a summary')
    })

    it('sets generating state', () => {
      getState().setIsGeneratingSummary(true)
      expect(getState().isGeneratingSummary).toBe(true)
    })
  })
})
