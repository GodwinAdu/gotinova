/**
 * Application-wide constants
 */

// App Info
export const APP_NAME = 'GotiNova'
export const APP_DESCRIPTION = 'Premium Hair & Beauty Store - Authentic, High-Quality Hairpieces'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Store Contact (WhatsApp)
// Format: country code + number without + or spaces (e.g. 233249595624)
export const STORE_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '233249595624'
export const STORE_PHONE = '+233 24 959 5624'
export const STORE_EMAIL = 'achaempomaatina352@gmail.com'

// Pagination
export const ITEMS_PER_PAGE = 12
export const ADMIN_ITEMS_PER_PAGE = 20

// Pricing
export const DEFAULT_SHIPPING_COST = 50
export const TAX_RATE = 0.125
export const MINIMUM_ORDER_AMOUNT = 100
export const CURRENCY_SYMBOL = 'GH₵'
export const CURRENCY_CODE = 'GHS'

// Product Categories
// Default Product Categories (admin can create more from the dashboard)
export const PRODUCT_CATEGORIES = [
  { id: '1', name: 'Hair & Wigs', description: 'Wigs, extensions, and hair products' },
  { id: '2', name: 'Beauty & Skincare', description: 'Skincare, makeup, and beauty tools' },
  { id: '3', name: 'Fashion', description: 'Clothing, bags, and accessories' },
  { id: '4', name: 'Electronics', description: 'Gadgets and tech accessories' },
  { id: '5', name: 'Health & Wellness', description: 'Supplements and health products' },
  { id: '6', name: 'Home & Living', description: 'Home decor and essentials' },
]

// Product Attributes
export const HAIR_TYPES = [
  'Straight',
  'Body Wave',
  'Loose Wave',
  'Deep Wave',
  'Curly',
  'Coily',
  'Kinky Straight',
]

export const HAIR_LENGTHS = [
  '8 inches',
  '10 inches',
  '12 inches',
  '14 inches',
  '16 inches',
  '18 inches',
  '20 inches',
  '22 inches',
  '24 inches+',
]

export const HAIR_COLORS = [
  'Natural Black',
  'Dark Brown',
  'Light Brown',
  'Honey Blonde',
  'Platinum Blonde',
  'Red',
  'Ombre',
  'Balayage',
]

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned',
} as const

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const

// Delivery Status
export const DELIVERY_STATUS = {
  PENDING: 'pending',
  IN_TRANSIT: 'in_transit',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  FAILED: 'failed',
} as const

// Review Status
export const REVIEW_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const

// Cities in Ghana
export const GHANA_CITIES = [
  'Accra',
  'Kumasi',
  'Tamale',
  'Takoradi',
  'Cape Coast',
  'Tema',
  'Obuasi',
  'Sunyani',
  'Ho',
  'Koforidua',
  'Wa',
  'Bolgatanga',
  'Techiman',
  'Nkawkaw',
  'Winneba',
  'Tarkwa',
  'Hohoe',
  'Keta',
  'Dunkwa',
  'Ejura',
]

// Payment Methods
export const PAYMENT_METHODS = {
  COD: 'cod',
  PAYSTACK: 'paystack',
  CARD: 'card',
  MOBILE_MONEY: 'mobile_money',
  BANK_TRANSFER: 'bank_transfer',
} as const

// Email Templates
export const EMAIL_TEMPLATES = {
  WELCOME: 'welcome',
  ORDER_CONFIRMATION: 'order_confirmation',
  ORDER_SHIPPED: 'order_shipped',
  ORDER_DELIVERED: 'order_delivered',
  REVIEW_REQUEST: 'review_request',
  PASSWORD_RESET: 'password_reset',
} as const

// Admin Roles
export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  SUPPORT: 'support',
} as const

// Permissions
export const PERMISSIONS = {
  MANAGE_PRODUCTS: 'manage_products',
  MANAGE_ORDERS: 'manage_orders',
  MANAGE_CUSTOMERS: 'manage_customers',
  MANAGE_ADMIN: 'manage_admin',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_COUPONS: 'manage_coupons',
  MANAGE_CATEGORIES: 'manage_categories',
  MANAGE_REVIEWS: 'manage_reviews',
} as const

// API Response Messages
export const API_MESSAGES = {
  SUCCESS: 'Operation successful',
  ERROR: 'An error occurred',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation error',
  SERVER_ERROR: 'Server error',
} as const

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PREFERENCES: 'user_preferences',
  CART: 'cart',
  WISHLIST: 'wishlist',
} as const

// Filter Options
export const FILTER_OPTIONS = {
  priceRanges: [
    { label: 'Under 500', min: 0, max: 500 },
    { label: '500 - 1,000', min: 500, max: 1000 },
    { label: '1,000 - 2,000', min: 1000, max: 2000 },
    { label: '2,000 - 5,000', min: 2000, max: 5000 },
    { label: 'Over 5,000', min: 5000, max: Infinity },
  ],
  sortOptions: [
    { label: 'Newest', value: 'newest' },
    { label: 'Best Selling', value: 'best_selling' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Top Rated', value: 'top_rated' },
  ],
  ratingFilters: [
    { stars: 5, label: '5 Stars' },
    { stars: 4, label: '4+ Stars' },
    { stars: 3, label: '3+ Stars' },
    { stars: 2, label: '2+ Stars' },
    { stars: 1, label: '1+ Stars' },
  ],
} as const

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const

// Regex Patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_GH: /^(\+233|0)?[0-9]{9}$/,
  URL: /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
} as const

// Limits
export const LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGE_SIZE: 2 * 1024 * 1024, // 2MB
  MAX_DESCRIPTION_LENGTH: 2000,
  MAX_REVIEW_LENGTH: 1000,
  MAX_CART_ITEMS: 100,
  MAX_WISHLIST_ITEMS: 500,
} as const

// Time Constants (in milliseconds)
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
} as const
