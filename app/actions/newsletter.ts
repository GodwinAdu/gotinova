'use server'

import { db } from '@/lib/db'
import { analytics } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { v4 as uuid } from 'uuid'

const NEWSLETTER_KEY = '1900-01-02' // Special date key for newsletter subscribers list

interface NewsletterData {
  subscribers: Array<{
    email: string
    subscribedAt: string
  }>
}

async function getNewsletterData(): Promise<NewsletterData> {
  try {
    const result = await db.select().from(analytics).where(eq(analytics.date, NEWSLETTER_KEY))
    if (result.length > 0 && result[0].data) {
      return JSON.parse(result[0].data)
    }
    return { subscribers: [] }
  } catch {
    return { subscribers: [] }
  }
}

async function saveNewsletterData(data: NewsletterData): Promise<void> {
  const existing = await db.select().from(analytics).where(eq(analytics.date, NEWSLETTER_KEY))
  if (existing.length > 0) {
    await db.update(analytics).set({ data: JSON.stringify(data) }).where(eq(analytics.date, NEWSLETTER_KEY))
  } else {
    await db.insert(analytics).values({ id: uuid(), date: NEWSLETTER_KEY, data: JSON.stringify(data) })
  }
}

export async function subscribeToNewsletter(email: string) {
  try {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address' }
    }

    const data = await getNewsletterData()

    // Check if already subscribed
    const exists = data.subscribers.find(s => s.email.toLowerCase() === email.toLowerCase())
    if (exists) {
      return { success: true, message: 'You are already subscribed!' }
    }

    // Add subscriber
    data.subscribers.push({
      email: email.toLowerCase().trim(),
      subscribedAt: new Date().toISOString(),
    })

    await saveNewsletterData(data)

    return { success: true, message: 'Successfully subscribed! Check your inbox for your welcome discount.' }
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return { success: false, error: 'Failed to subscribe. Please try again.' }
  }
}

export async function getNewsletterSubscribers() {
  try {
    const data = await getNewsletterData()
    return { success: true, data: data.subscribers }
  } catch (error) {
    return { success: false, error: 'Failed to fetch subscribers' }
  }
}
