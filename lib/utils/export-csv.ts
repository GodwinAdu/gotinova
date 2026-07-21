'use client'

/**
 * Export data as CSV file download
 */

interface CSVColumn<T> {
  header: string
  accessor: (row: T) => string | number
}

export function exportToCSV<T>(
  data: T[],
  columns: CSVColumn<T>[],
  filename: string
): void {
  if (data.length === 0) return

  // Build CSV header
  const headers = columns.map((col) => `"${col.header}"`).join(',')

  // Build CSV rows
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = col.accessor(row)
        // Escape quotes and wrap in quotes
        const escaped = String(value).replace(/"/g, '""')
        return `"${escaped}"`
      })
      .join(',')
  )

  // Combine
  const csv = [headers, ...rows].join('\n')

  // Create blob and download
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export orders to CSV
 */
export function exportOrdersCSV(orders: any[]): void {
  exportToCSV(
    orders,
    [
      { header: 'Order Number', accessor: (o) => o.orderNumber || '' },
      { header: 'Date', accessor: (o) => o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '' },
      { header: 'Customer', accessor: (o) => o.customerName || o.customerEmail || 'N/A' },
      { header: 'Email', accessor: (o) => o.customerEmail || '' },
      { header: 'Amount (GHS)', accessor: (o) => parseFloat(o.totalAmount || '0').toFixed(2) },
      { header: 'Status', accessor: (o) => o.status || 'pending' },
      { header: 'Payment Status', accessor: (o) => o.paymentStatus || 'pending' },
      { header: 'Payment Method', accessor: (o) => o.paymentMethod || '' },
    ],
    'gotinova-orders'
  )
}

/**
 * Export customers to CSV
 */
export function exportCustomersCSV(customers: any[]): void {
  exportToCSV(
    customers,
    [
      { header: 'Name', accessor: (c) => c.name || 'Unnamed' },
      { header: 'Email', accessor: (c) => c.email || '' },
      { header: 'Total Orders', accessor: (c) => c.totalOrders || 0 },
      { header: 'Total Spent (GHS)', accessor: (c) => parseFloat(c.totalSpent || '0').toFixed(2) },
      { header: 'Joined', accessor: (c) => c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '' },
    ],
    'gotinova-customers'
  )
}

/**
 * Export products to CSV
 */
export function exportProductsCSV(products: any[]): void {
  exportToCSV(
    products,
    [
      { header: 'Name', accessor: (p) => p.name || '' },
      { header: 'SKU', accessor: (p) => p.sku || '' },
      { header: 'Price (GHS)', accessor: (p) => parseFloat(p.price || '0').toFixed(2) },
      { header: 'Stock', accessor: (p) => p.stock || 0 },
      { header: 'Active', accessor: (p) => p.isActive ? 'Yes' : 'No' },
      { header: 'Category ID', accessor: (p) => p.categoryId || '' },
    ],
    'gotinova-products'
  )
}
