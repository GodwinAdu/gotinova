'use client'

import { useEffect, useRef } from 'react'
import { useToast } from './toast'
import { formatPrice } from '@/lib/utils/format'

/**
 * Admin Notification Poller
 * 
 * Polls for new orders every 30 seconds and shows toast notifications.
 * Uses localStorage to track the last known order count so it only
 * fires for genuinely new orders.
 */

const POLL_INTERVAL = 30000 // 30 seconds
const STORAGE_KEY = 'luxehair-admin-last-order-count'

async function fetchOrderCount(): Promise<{ count: number; latest?: { orderNumber: string; totalAmount: string } } | null> {
  try {
    // Use the admin stats action via a simple fetch to avoid server action complexity
    const { getAdminStats, getAllOrders } = await import('@/app/actions/admin')
    const stats = await getAdminStats()
    const orders = await getAllOrders(1)

    if (stats.success && stats.data) {
      const latest = orders.success && orders.data && orders.data.length > 0 ? orders.data[0] : undefined
      return {
        count: stats.data.totalOrders,
        latest: latest ? { orderNumber: latest.orderNumber, totalAmount: latest.totalAmount } : undefined,
      }
    }
    return null
  } catch {
    return null
  }
}

export function AdminNotifications() {
  const { toast } = useToast()
  const initializedRef = useRef(false)

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return

    const checkForNewOrders = async () => {
      const result = await fetchOrderCount()
      if (!result) return

      const lastCount = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10)

      if (!initializedRef.current) {
        // First load — just store current count without notification
        localStorage.setItem(STORAGE_KEY, result.count.toString())
        initializedRef.current = true
        return
      }

      if (result.count > lastCount) {
        const newOrders = result.count - lastCount
        toast({
          type: 'order',
          title: `🎉 New Order${newOrders > 1 ? 's' : ''}!`,
          message: result.latest
            ? `${result.latest.orderNumber} — ${formatPrice(result.latest.totalAmount)}`
            : `${newOrders} new order${newOrders > 1 ? 's' : ''} received`,
          duration: 8000,
        })
        localStorage.setItem(STORAGE_KEY, result.count.toString())
      }
    }

    // Initial check
    checkForNewOrders()

    // Poll every 30 seconds
    const interval = setInterval(checkForNewOrders, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [toast])

  return null // This component renders nothing — just runs the polling logic
}
