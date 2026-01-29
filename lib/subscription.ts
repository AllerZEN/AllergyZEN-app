// Subscription and trial management with localStorage persistence

export type SubscriptionTier = "trial" | "freemium" | "pro"

export interface SubscriptionState {
  tier: SubscriptionTier
  trialStartDate: string | null
  trialEndDate: string | null
  scansToday: number
  mealsToday: number
  lastResetDate: string
}

const STORAGE_KEY = "allergyzen_subscription"
const TRIAL_DURATION_DAYS = 7
const FREEMIUM_SCAN_LIMIT = 3
const FREEMIUM_MEAL_LIMIT = 2

function isBrowser(): boolean {
  return typeof window !== "undefined"
}

export function getSubscription(): SubscriptionState {
  if (!isBrowser()) {
    return createDefaultSubscription()
  }

  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    // First time user - start free trial
    const newSub = createTrialSubscription()
    saveSubscription(newSub)
    return newSub
  }

  try {
    const sub = JSON.parse(stored) as SubscriptionState
    // Check if we need to reset daily counters
    const today = new Date().toDateString()
    if (sub.lastResetDate !== today) {
      sub.scansToday = 0
      sub.mealsToday = 0
      sub.lastResetDate = today
      saveSubscription(sub)
    }
    // Check if trial has expired
    if (sub.tier === "trial" && sub.trialEndDate) {
      const endDate = new Date(sub.trialEndDate)
      if (new Date() > endDate) {
        sub.tier = "freemium"
        saveSubscription(sub)
      }
    }
    return sub
  } catch {
    return createDefaultSubscription()
  }
}

function createDefaultSubscription(): SubscriptionState {
  return {
    tier: "freemium",
    trialStartDate: null,
    trialEndDate: null,
    scansToday: 0,
    mealsToday: 0,
    lastResetDate: new Date().toDateString(),
  }
}

function createTrialSubscription(): SubscriptionState {
  const now = new Date()
  const endDate = new Date(now)
  endDate.setDate(endDate.getDate() + TRIAL_DURATION_DAYS)

  return {
    tier: "trial",
    trialStartDate: now.toISOString(),
    trialEndDate: endDate.toISOString(),
    scansToday: 0,
    mealsToday: 0,
    lastResetDate: now.toDateString(),
  }
}

export function saveSubscription(sub: SubscriptionState): void {
  if (!isBrowser()) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sub))
}

export function getTrialDaysRemaining(): number {
  const sub = getSubscription()
  if (sub.tier !== "trial" || !sub.trialEndDate) return 0

  const endDate = new Date(sub.trialEndDate)
  const now = new Date()
  const diffTime = endDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return Math.max(0, diffDays)
}

export function canPerformScan(): { allowed: boolean; remaining: number; limit: number } {
  const sub = getSubscription()

  // Pro and trial users have unlimited scans
  if (sub.tier === "pro" || sub.tier === "trial") {
    return { allowed: true, remaining: Number.POSITIVE_INFINITY, limit: Number.POSITIVE_INFINITY }
  }

  // Freemium users have daily limits
  const remaining = FREEMIUM_SCAN_LIMIT - sub.scansToday
  return {
    allowed: remaining > 0,
    remaining: Math.max(0, remaining),
    limit: FREEMIUM_SCAN_LIMIT,
  }
}

export function canGenerateMeal(): { allowed: boolean; remaining: number; limit: number } {
  const sub = getSubscription()

  // Pro and trial users have unlimited meals
  if (sub.tier === "pro" || sub.tier === "trial") {
    return { allowed: true, remaining: Number.POSITIVE_INFINITY, limit: Number.POSITIVE_INFINITY }
  }

  // Freemium users have daily limits
  const remaining = FREEMIUM_MEAL_LIMIT - sub.mealsToday
  return {
    allowed: remaining > 0,
    remaining: Math.max(0, remaining),
    limit: FREEMIUM_MEAL_LIMIT,
  }
}

export function recordScan(): void {
  const sub = getSubscription()
  sub.scansToday += 1
  saveSubscription(sub)
}

export function recordMealGeneration(): void {
  const sub = getSubscription()
  sub.mealsToday += 1
  saveSubscription(sub)
}

export function upgradeToPro(): void {
  const sub = getSubscription()
  sub.tier = "pro"
  saveSubscription(sub)
}

export function isProUser(): boolean {
  const sub = getSubscription()
  return sub.tier === "pro" || sub.tier === "trial"
}

export function resetSubscription(): void {
  if (!isBrowser()) return
  localStorage.removeItem(STORAGE_KEY)
}
