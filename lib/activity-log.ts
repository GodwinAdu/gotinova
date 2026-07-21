/**
 * Admin Activity Log
 * 
 * Stores admin actions in localStorage (client-side log).
 * In production, you'd store this in a DB table.
 * 
 * Tracks: who did what, when, and on which resource.
 */

export interface ActivityEntry {
  id: string
  action: string
  resource: string
  resourceId?: string
  details?: string
  adminEmail?: string
  timestamp: string
}

const STORAGE_KEY = 'gotinova-activity-log'
const MAX_ENTRIES = 100

function getLog(): ActivityEntry[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function saveLog(entries: ActivityEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)))
}

export function logActivity(entry: Omit<ActivityEntry, 'id' | 'timestamp'>) {
  if (typeof window === 'undefined') return

  const log = getLog()
  log.unshift({
    ...entry,
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
  })
  saveLog(log)
}

export function getActivityLog(limit = 50): ActivityEntry[] {
  return getLog().slice(0, limit)
}

export function clearActivityLog() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
