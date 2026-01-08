import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type ContentWidth = 'standard' | 'wide' | 'narrow'

// ============================================
// UI Store (non-persisted)
// ============================================
interface UIStore {
  isNotesOpen: boolean
  openNotes: () => void
  closeNotes: () => void
  toggleNotes: () => void


  
  contentWidth: ContentWidth
  setContentWidth: (width: ContentWidth) => void

  isSidebarOpen: boolean
  openSidebar: () => void
  closeSidebar: () => void
  toggleSidebar: () => void

  isCommandPaletteOpen: boolean
  openCommandPalette: () => void
  closeCommandPalette: () => void
  toggleCommandPalette: () => void

  isSearchOpen: boolean
  openSearch: () => void
  closeSearch: () => void
  toggleSearch: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  isNotesOpen: false,
  openNotes: () => set({ isNotesOpen: true }),
  closeNotes: () => set({ isNotesOpen: false }),
  toggleNotes: () => set((state) => ({ isNotesOpen: !state.isNotesOpen })),



  contentWidth: 'standard',
  setContentWidth: (width) => set({ contentWidth: width }),

  isSidebarOpen: true,
  openSidebar: () => set({ isSidebarOpen: true, contentWidth: 'standard' }),
  closeSidebar: () => set({ isSidebarOpen: false }),
  toggleSidebar: () => set((state) => {
    const nextState = !state.isSidebarOpen
    return { 
      isSidebarOpen: nextState,
      contentWidth: nextState ? 'standard' : state.contentWidth 
    }
  }),

  isCommandPaletteOpen: false,
  openCommandPalette: () => set({ isCommandPaletteOpen: true }),
  closeCommandPalette: () => set({ isCommandPaletteOpen: false }),
  toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),

  isSearchOpen: false,
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
}))

// ============================================
// Progress Store (persisted)
// ============================================
interface ProgressState {
  completedModules: string[]
  bookmarkedModules: string[]
  lastVisitedModule: string | null
  lastVisitedAt: string | null
  moduleProgress: Record<string, number> // slug -> scroll percentage
  timeSpent: Record<string, number> // slug -> seconds
  
  // Streak tracking
  streakDays: number
  lastActivityDate: string | null
  longestStreak: number
  activityHistory: string[] // Array of ISO date strings
  
  // Actions
  markComplete: (slug: string) => void
  markIncomplete: (slug: string) => void
  toggleComplete: (slug: string) => void
  isCompleted: (slug: string) => boolean
  
  toggleBookmark: (slug: string) => void
  isBookmarked: (slug: string) => boolean
  
  setLastVisited: (slug: string) => void
  updateModuleProgress: (slug: string, progress: number) => void
  addTimeSpent: (slug: string, seconds: number) => void
  
  recordActivity: () => void
  getCompletionPercentage: (totalModules: number) => number
}

const getTodayISO = () => new Date().toISOString().split('T')[0]

const calculateStreak = (activityHistory: string[], lastActivityDate: string | null): number => {
  if (!lastActivityDate) return 0
  
  const today = getTodayISO()
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  
  // If last activity was before yesterday, streak is broken
  if (lastActivityDate < yesterday) return 0
  
  // Count consecutive days backwards from today/yesterday
  let streak = 0
  let checkDate = lastActivityDate === today ? today : yesterday
  
  while (activityHistory.includes(checkDate)) {
    streak++
    const prevDate = new Date(checkDate)
    prevDate.setDate(prevDate.getDate() - 1)
    checkDate = prevDate.toISOString().split('T')[0]
  }
  
  return streak
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      completedModules: [],
      bookmarkedModules: [],
      lastVisitedModule: null,
      lastVisitedAt: null,
      moduleProgress: {},
      timeSpent: {},
      streakDays: 0,
      lastActivityDate: null,
      longestStreak: 0,
      activityHistory: [],

      markComplete: (slug) => set((state) => {
        if (state.completedModules.includes(slug)) return state
        const newCompleted = [...state.completedModules, slug]
        return { completedModules: newCompleted }
      }),

      markIncomplete: (slug) => set((state) => ({
        completedModules: state.completedModules.filter((s) => s !== slug)
      })),

      toggleComplete: (slug) => set((state) => {
        const isCompleted = state.completedModules.includes(slug)
        return {
          completedModules: isCompleted
            ? state.completedModules.filter((s) => s !== slug)
            : [...state.completedModules, slug]
        }
      }),

      isCompleted: (slug) => get().completedModules.includes(slug),

      toggleBookmark: (slug) => set((state) => {
        const isBookmarked = state.bookmarkedModules.includes(slug)
        return {
          bookmarkedModules: isBookmarked
            ? state.bookmarkedModules.filter((s) => s !== slug)
            : [...state.bookmarkedModules, slug]
        }
      }),

      isBookmarked: (slug) => get().bookmarkedModules.includes(slug),

      setLastVisited: (slug) => set({
        lastVisitedModule: slug,
        lastVisitedAt: new Date().toISOString()
      }),

      updateModuleProgress: (slug, progress) => set((state) => ({
        moduleProgress: { ...state.moduleProgress, [slug]: progress }
      })),

      addTimeSpent: (slug, seconds) => set((state) => ({
        timeSpent: {
          ...state.timeSpent,
          [slug]: (state.timeSpent[slug] || 0) + seconds
        }
      })),

      recordActivity: () => set((state) => {
        const today = getTodayISO()
        
        // Already recorded today
        if (state.lastActivityDate === today) return state
        
        const newHistory = state.activityHistory.includes(today)
          ? state.activityHistory
          : [...state.activityHistory, today].slice(-365) // Keep last year
        
        const newStreak = calculateStreak(newHistory, today)
        
        return {
          lastActivityDate: today,
          activityHistory: newHistory,
          streakDays: newStreak,
          longestStreak: Math.max(state.longestStreak, newStreak)
        }
      }),

      getCompletionPercentage: (totalModules) => {
        const completed = get().completedModules.length
        return totalModules > 0 ? Math.round((completed / totalModules) * 100) : 0
      }
    }),
    {
      name: 'agentic-progress',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        completedModules: state.completedModules,
        bookmarkedModules: state.bookmarkedModules,
        lastVisitedModule: state.lastVisitedModule,
        lastVisitedAt: state.lastVisitedAt,
        moduleProgress: state.moduleProgress,
        timeSpent: state.timeSpent,
        streakDays: state.streakDays,
        lastActivityDate: state.lastActivityDate,
        longestStreak: state.longestStreak,
        activityHistory: state.activityHistory,
      })
    }
  )
)

// ============================================
// Exercise Progress Store (persisted)
// ============================================
interface ExerciseState {
  completedExercises: Record<string, string[]> // moduleSlug -> exerciseIds
  quizAnswers: Record<string, Record<string, string>> // moduleSlug -> { questionId: answer }
  
  markExerciseComplete: (moduleSlug: string, exerciseId: string) => void
  isExerciseComplete: (moduleSlug: string, exerciseId: string) => boolean
  saveQuizAnswer: (moduleSlug: string, questionId: string, answer: string) => void
  getQuizAnswer: (moduleSlug: string, questionId: string) => string | undefined
  getModuleExerciseProgress: (moduleSlug: string, totalExercises: number) => number
}

export const useExerciseStore = create<ExerciseState>()(
  persist(
    (set, get) => ({
      completedExercises: {},
      quizAnswers: {},

      markExerciseComplete: (moduleSlug, exerciseId) => set((state) => {
        const moduleExercises = state.completedExercises[moduleSlug] || []
        if (moduleExercises.includes(exerciseId)) return state
        return {
          completedExercises: {
            ...state.completedExercises,
            [moduleSlug]: [...moduleExercises, exerciseId]
          }
        }
      }),

      isExerciseComplete: (moduleSlug, exerciseId) => {
        const moduleExercises = get().completedExercises[moduleSlug] || []
        return moduleExercises.includes(exerciseId)
      },

      saveQuizAnswer: (moduleSlug, questionId, answer) => set((state) => ({
        quizAnswers: {
          ...state.quizAnswers,
          [moduleSlug]: {
            ...(state.quizAnswers[moduleSlug] || {}),
            [questionId]: answer
          }
        }
      })),

      getQuizAnswer: (moduleSlug, questionId) => {
        return get().quizAnswers[moduleSlug]?.[questionId]
      },

      getModuleExerciseProgress: (moduleSlug, totalExercises) => {
        const completed = get().completedExercises[moduleSlug]?.length || 0
        return totalExercises > 0 ? Math.round((completed / totalExercises) * 100) : 0
      }
    }),
    {
      name: 'agentic-exercises',
      storage: createJSONStorage(() => localStorage)
    }
  )
)

// ============================================
// Preferences Store (persisted)
// ============================================
interface PreferencesState {
  fontSize: 'small' | 'medium' | 'large'
  reducedMotion: boolean
  showReadingProgress: boolean
  showEstimatedTime: boolean
  autoMarkComplete: boolean
  
  // API Keys / Smart Copy
  injectKeys: boolean
  apiKeys: Record<string, string>

  setFontSize: (size: 'small' | 'medium' | 'large') => void
  setReducedMotion: (value: boolean) => void
  setShowReadingProgress: (value: boolean) => void
  setShowEstimatedTime: (value: boolean) => void
  setAutoMarkComplete: (value: boolean) => void
  setInjectKeys: (value: boolean) => void
  setApiKey: (service: string, key: string) => void
  fontSans: string
  setFontSans: (font: string) => void
  fontMono: string
  setFontMono: (font: string) => void
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      fontSize: 'medium',
      reducedMotion: false,
      showReadingProgress: true,
      showEstimatedTime: true,
      autoMarkComplete: false,
      injectKeys: true,
      apiKeys: {},

      setFontSize: (size) => set({ fontSize: size }),
      setReducedMotion: (value) => set({ reducedMotion: value }),
      setShowReadingProgress: (value) => set({ showReadingProgress: value }),
      setShowEstimatedTime: (value) => set({ showEstimatedTime: value }),
      setAutoMarkComplete: (value) => set({ autoMarkComplete: value }),
      setInjectKeys: (value) => set({ injectKeys: value }),
      setApiKey: (service, key) => set((state) => ({ 
        apiKeys: { ...state.apiKeys, [service]: key } 
      })),
      fontSans: 'inter',
      setFontSans: (fontSans) => set({ fontSans }),
      fontMono: 'jetbrains',
      setFontMono: (fontMono) => set({ fontMono }),
    }),
    {
      name: 'agentic-preferences',
      storage: createJSONStorage(() => localStorage)
    }
  )
)

// Deprecated alias for backward compatibility
export const useNotesStore = () => {
  const store = useUIStore()
  return {
    isOpen: store.isNotesOpen,
    openNotes: store.openNotes,
    closeNotes: store.closeNotes,
    toggleNotes: store.toggleNotes
  }
}
