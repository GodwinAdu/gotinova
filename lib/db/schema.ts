import { pgTable, text, timestamp, boolean, decimal, integer, date, unique } from 'drizzle-orm/pg-core'

// Better Auth tables
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  name: text('name'),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
    accountId: text('accountId').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refreshToken: text('refreshToken'),
    accessToken: text('accessToken'),
    expiresAt: integer('expiresAt'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => [
    unique('unique_provider').on(table.provider, table.providerAccountId),
  ]
)

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// App tables
export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  image: text('image'),
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal('originalPrice', { precision: 10, scale: 2 }),
  categoryId: text('categoryId').notNull().references(() => categories.id, { onDelete: 'cascade' }),
  stock: integer('stock').notNull().default(0),
  image: text('image'),
  images: text('images'),
  sku: text('sku').unique(),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0'),
  reviewCount: integer('reviewCount').default(0),
  isActive: boolean('isActive').default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const productAttributes = pgTable('productAttributes', {
  id: text('id').primaryKey(),
  productId: text('productId').notNull().references(() => products.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  value: text('value').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const cartItems = pgTable(
  'cartItems',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
    productId: text('productId').notNull().references(() => products.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull().default(1),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (table) => [unique('unique_user_product').on(table.userId, table.productId)]
)

export const wishlistItems = pgTable(
  'wishlistItems',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
    productId: text('productId').notNull().references(() => products.id, { onDelete: 'cascade' }),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  (table) => [unique('unique_wishlist').on(table.userId, table.productId)]
)

export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  orderNumber: text('orderNumber').notNull().unique(),
  totalAmount: decimal('totalAmount', { precision: 12, scale: 2 }).notNull(),
  subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull(),
  shippingCost: decimal('shippingCost', { precision: 10, scale: 2 }).default('0'),
  tax: decimal('tax', { precision: 10, scale: 2 }).default('0'),
  discountAmount: decimal('discountAmount', { precision: 10, scale: 2 }).default('0'),
  status: text('status').default('pending'),
  paymentStatus: text('paymentStatus').default('pending'),
  paymentMethod: text('paymentMethod'),
  shippingAddress: text('shippingAddress'),
  billingAddress: text('billingAddress'),
  notes: text('notes'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const orderItems = pgTable('orderItems', {
  id: text('id').primaryKey(),
  orderId: text('orderId').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: text('productId'),
  productName: text('productName').notNull(),
  quantity: integer('quantity').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const reviews = pgTable('reviews', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  productId: text('productId').notNull().references(() => products.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(),
  title: text('title'),
  comment: text('comment'),
  images: text('images'),
  verified: boolean('verified').default(false),
  helpful: integer('helpful').default(0),
  status: text('status').default('pending'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const deliveryTracking = pgTable('deliveryTracking', {
  id: text('id').primaryKey(),
  orderId: text('orderId').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  trackingNumber: text('trackingNumber').unique(),
  carrier: text('carrier'),
  status: text('status').default('pending'),
  currentLocation: text('currentLocation'),
  estimatedDelivery: timestamp('estimatedDelivery'),
  actualDelivery: timestamp('actualDelivery'),
  events: text('events'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const coupons = pgTable('coupons', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  description: text('description'),
  discountType: text('discountType').notNull(),
  discountValue: decimal('discountValue', { precision: 10, scale: 2 }).notNull(),
  maxUses: integer('maxUses'),
  currentUses: integer('currentUses').default(0),
  minOrderAmount: decimal('minOrderAmount', { precision: 10, scale: 2 }),
  validFrom: timestamp('validFrom'),
  validTo: timestamp('validTo'),
  isActive: boolean('isActive').default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const analytics = pgTable(
  'analytics',
  {
    id: text('id').primaryKey(),
    date: date('date').notNull(),
    totalRevenue: decimal('totalRevenue', { precision: 12, scale: 2 }).default('0'),
    totalOrders: integer('totalOrders').default(0),
    totalCustomers: integer('totalCustomers').default(0),
    newCustomers: integer('newCustomers').default(0),
    averageOrderValue: decimal('averageOrderValue', { precision: 10, scale: 2 }).default('0'),
    conversionRate: decimal('conversionRate', { precision: 5, scale: 2 }).default('0'),
    data: text('data'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  (table) => [unique('unique_date').on(table.date)]
)

export const frequentlyBoughtTogether = pgTable(
  'frequentlyBoughtTogether',
  {
    id: text('id').primaryKey(),
    productId: text('productId').notNull().references(() => products.id, { onDelete: 'cascade' }),
    relatedProductId: text('relatedProductId').notNull().references(() => products.id, { onDelete: 'cascade' }),
    score: decimal('score', { precision: 5, scale: 2 }).default('0'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  (table) => [unique('unique_fbt').on(table.productId, table.relatedProductId)]
)

export const adminUsers = pgTable('adminUsers', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  role: text('role').notNull().default('admin'),
  permissions: text('permissions'),
  isActive: boolean('isActive').default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})
