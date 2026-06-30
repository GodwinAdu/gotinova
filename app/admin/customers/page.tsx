'use client'

import { useEffect, useState } from 'react'
import { Loader2, Search, Mail, Phone } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  totalOrders: number
  totalSpent: number
  joinedDate: string
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    // Simulate loading customers
    const loadCustomers = async () => {
      try {
        setLoading(true)
        // Mock data - would call API in real app
        const mockCustomers: Customer[] = [
          {
            id: '1',
            name: 'Ahmed Ali',
            email: 'ahmed@example.com',
            phone: '+92 300 1234567',
            totalOrders: 5,
            totalSpent: 25000,
            joinedDate: '2024-01-15',
          },
          {
            id: '2',
            name: 'Fatima Khan',
            email: 'fatima@example.com',
            phone: '+92 321 9876543',
            totalOrders: 12,
            totalSpent: 85000,
            joinedDate: '2023-12-20',
          },
        ]
        setCustomers(mockCustomers)
      } catch (err) {
        console.error('[v0] Load customers error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadCustomers()
  }, [])

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Customers</h1>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Customers List */}
      {loading ? (
        <Card className="p-12 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </Card>
      ) : filteredCustomers.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No customers found</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Phone</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Orders</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Total Spent</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Joined</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground">{customer.name}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {customer.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {customer.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {customer.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline">{customer.totalOrders}</Badge>
                    </td>
                    <td className="px-6 py-4 font-semibold text-primary">
                      PKR {customer.totalSpent.toFixed(0)}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(customer.joinedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Button variant="outline" size="sm">View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
