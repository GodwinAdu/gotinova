'use server'

import { db } from '@/lib/db'
import { user as userTable, adminUsers } from '@/lib/db/schema'
import { eq, and, inArray } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { sendCampaignEmail } from '@/lib/email'

async function verifyAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  const admin = await db.select().from(adminUsers).where(and(eq(adminUsers.userId, session.user.id), eq(adminUsers.isActive, true)))
  if (!admin.length) throw new Error('Not authorized as admin')
}

export async function getAllCustomerEmails() {
  try {
    await verifyAdmin()

    const users = await db
      .select({
        id: userTable.id,
        name: userTable.name,
        email: userTable.email,
        createdAt: userTable.createdAt,
      })
      .from(userTable)
      .orderBy(userTable.createdAt)

    return { success: true, data: users }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch customers' }
  }
}

export async function sendEmailCampaign(data: {
  subject: string
  heading: string
  body: string
  ctaText?: string
  ctaUrl?: string
  recipientIds: string[] // user IDs, or ['all'] for everyone
}) {
  try {
    await verifyAdmin()

    if (!data.subject || !data.heading || !data.body) {
      return { success: false, error: 'Subject, heading, and body are required' }
    }

    if (!data.recipientIds.length) {
      return { success: false, error: 'Please select at least one recipient' }
    }

    // Get recipients
    let recipients: Array<{ id: string; email: string; name: string | null }>

    if (data.recipientIds.includes('all')) {
      recipients = await db
        .select({ id: userTable.id, email: userTable.email, name: userTable.name })
        .from(userTable)
    } else {
      recipients = await db
        .select({ id: userTable.id, email: userTable.email, name: userTable.name })
        .from(userTable)
        .where(inArray(userTable.id, data.recipientIds))
    }

    if (!recipients.length) {
      return { success: false, error: 'No valid recipients found' }
    }

    // Send emails (in batches to avoid overwhelming SMTP)
    let sent = 0
    let failed = 0

    for (const recipient of recipients) {
      try {
        const success = await sendCampaignEmail({
          to: recipient.email,
          subject: data.subject,
          heading: data.heading,
          body: data.body,
          ctaText: data.ctaText,
          ctaUrl: data.ctaUrl,
        })

        if (success) {
          sent++
        } else {
          failed++
        }

        // Small delay between emails to respect SMTP rate limits
        if (recipients.length > 5) {
          await new Promise(resolve => setTimeout(resolve, 200))
        }
      } catch {
        failed++
      }
    }

    return {
      success: true,
      message: `Campaign sent! ${sent} delivered, ${failed} failed.`,
      data: { sent, failed, total: recipients.length },
    }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to send campaign' }
  }
}
