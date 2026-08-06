'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, User, Mail, Phone, MapPin, Save, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Header } from '@/components/header'
import { useSession, authClient } from '@/lib/auth-client'
import Link from 'next/link'

export default function EditProfilePage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isPending) return
    if (!session?.user) {
      router.push('/sign-in?redirect=/account/profile')
      return
    }
    setName(session.user.name || '')
  }, [session, isPending, router])

  // Load saved address
  useEffect(() => {
    import('@/app/actions/user-address').then(({ getSavedAddress }) => {
      getSavedAddress().then((saved) => {
        if (saved) {
          setPhone(saved.phone || '')
          setAddress(saved.address || '')
          setCity(saved.city || '')
        }
      }).catch(() => {})
    }).catch(() => {})
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      // Update name via better-auth
      if (name.trim() && name !== session?.user?.name) {
        await authClient.updateUser({ name: name.trim() })
      }

      // Save address info
      const { saveAddress } = await import('@/app/actions/user-address')
      await saveAddress({
        firstName: name.split(' ')[0] || '',
        lastName: name.split(' ').slice(1).join(' ') || '',
        phone,
        address,
        city,
        email: session?.user?.email || '',
        zipCode: '',
      })

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  if (isPending) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </>
    )
  }

  if (!session?.user) return null

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-lg mx-auto px-4 py-8">
          {/* Back button */}
          <Link href="/account" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Account
          </Link>

          <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>

          {/* Success message */}
          {success && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Profile updated successfully!</p>
            </div>
          )}

          {error && (
            <div className="p-3 mb-4 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSave}>
            <Card className="p-5 sm:p-6 rounded-2xl space-y-5">
              {/* Email (read-only) */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                  Email
                </label>
                <Input
                  value={session.user.email || ''}
                  disabled
                  className="bg-muted/50 opacity-70"
                />
                <p className="text-[11px] text-muted-foreground mt-1">Email cannot be changed</p>
              </div>

              {/* Full Name */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  Full Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                  Phone Number
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+233 XX XXX XXXX"
                  type="tel"
                />
              </div>

              {/* Address */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                  Delivery Address
                </label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address, house number"
                />
              </div>

              {/* City */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                  City
                </label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Kumasi, Accra"
                />
              </div>

              {/* Save Button */}
              <Button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl h-11"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </Card>
          </form>
        </div>
      </main>
    </>
  )
}
