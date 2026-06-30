'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, LogOut, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useSession } from '@/lib/auth-client'
import { authClient } from '@/lib/auth-client'
import Link from 'next/link'

interface UserProfile {
  id: string
  email: string
  name?: string
  createdAt: string
  orderCount: number
}

export default function AccountPage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    if (isPending) return
    
    if (!session?.user) {
      router.push('/sign-in?redirect=/account')
      return
    }

    // Mock profile loading
    setProfile({
      id: session.user.id,
      email: session.user.email || '',
      name: session.user.name || 'User',
      createdAt: new Date().toLocaleDateString(),
      orderCount: 0,
    })
    setName(session.user.name || '')
    setEmail(session.user.email || '')
    setLoading(false)
  }, [session, isPending, router])

  const handleLogout = async () => {
    try {
      setSigningOut(true)
      await authClient.signOut()
      router.push('/')
    } catch (err) {
      console.error('[v0] Logout error:', err)
    } finally {
      setSigningOut(false)
    }
  }

  if (loading || isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md p-6 text-center">
          <p className="text-muted-foreground mb-4">Please log in to view your account</p>
          <Link href="/sign-in">
            <Button className="w-full bg-primary hover:bg-primary/90">Sign In</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Account</h1>
          <Button
            onClick={handleLogout}
            disabled={signingOut}
            variant="outline"
            className="gap-2"
          >
            {signingOut ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Logging out...
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                Logout
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-4 text-foreground">Account Stats</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold text-primary">{profile.orderCount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="text-lg font-semibold">{profile.createdAt}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className="bg-green-600 mt-1">Active</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4 text-foreground">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/orders" className="block">
                  <Button variant="ghost" className="w-full justify-start">My Orders</Button>
                </Link>
                <Link href="/wishlist" className="block">
                  <Button variant="ghost" className="w-full justify-start">Wishlist</Button>
                </Link>
                <Button variant="ghost" className="w-full justify-start">Addresses</Button>
                <Button variant="ghost" className="w-full justify-start">Payment Methods</Button>
              </div>
            </Card>
          </div>

          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Personal Information</h2>
                <Button
                  onClick={() => setEditing(!editing)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Settings className="w-4 h-4" />
                  {editing ? 'Cancel' : 'Edit'}
                </Button>
              </div>

              {editing ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    setEditing(false)
                    // Here you would call an update action
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input
                      type="email"
                      value={email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                    Save Changes
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="text-lg font-semibold">{name || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-lg font-semibold">{email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Account ID</p>
                    <p className="text-sm font-mono text-muted-foreground">{profile.id}</p>
                  </div>
                </div>
              )}
            </Card>

            {/* Saved Addresses */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Saved Addresses</h2>
                <Button size="sm" className="bg-primary hover:bg-primary/90">Add Address</Button>
              </div>
              <p className="text-muted-foreground text-center py-8">No saved addresses yet</p>
            </Card>

            {/* Security */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6">Security Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded">
                  <div>
                    <p className="font-medium">Change Password</p>
                    <p className="text-sm text-muted-foreground">Update your password regularly</p>
                  </div>
                  <Button variant="outline" size="sm">Change</Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline" size="sm">Enable</Button>
                </div>
              </div>
            </Card>

            {/* Preferences */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6">Preferences</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-sm font-medium">Receive order updates via email</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-sm font-medium">Receive promotional offers</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-sm font-medium">Receive SMS notifications</span>
                </label>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
