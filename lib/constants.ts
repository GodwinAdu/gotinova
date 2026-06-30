/**
 * Application-wide constants
 */

// App Info
export const APP_NAME = 'LuxeHair'
export const APP_DESCRIPTION = 'Premium Hair & Wig Store - Authentic, High-Quality Hairpieces'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Pagination
export const ITEMS_PER_PAGE = 12
export const ADMIN_ITEMS_PER_PAGE = 20

// Pricing
export const DEFAULT_SHIPPING_COST = 500
export const TAX_RATE = 0.17
export const MINIMUM_ORDER_AMOUNT = 1000

// Product Categories
export const PRODUCT_CATEGORIES = [
  { id: '1', name: 'Brazilian Hair', description: 'High-quality Brazilian hair bundles' },
  { id: '2', name: 'Malaysian Hair', description: 'Luxurious Malaysian hair extensions' },
  { id: '3', name: 'Peruvian Hair', description: 'Premium Peruvian hair wigs' },
  { id: '4', name: 'Indian Hair', description: 'Authentic Indian hair products' },
  { id: '5', name: 'Closure & Frontals', description: 'HD lace closures and frontals' },
  { id: '6', name: 'Wigs', description: 'Ready-to-wear wigs' },
  { id: '7', name: 'Accessories', description: 'Hair care accessories' },
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

// Cities in Pakistan
export const PAKISTAN_CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Peshawar',
  'Multan',
  'Faisalabad',
  'Hyderabad',
  'Quetta',
  'Gujranwala',
  'Sialkot',
  'Sargodha',
  'Bahawalpur',
  'Jhang',
  'Dera Ghazi Khan',
  'Larkana',
  'Sukkur',
  'Shikarpur',
  'Mirpur Khas',
  'Thatta',
]

// Payment Methods
export const PAYMENT_METHODS = {
  COD: 'cod',
  ADVANCE: 'advance',
  CARD: 'card',
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
    { label: 'Under 5,000', min: 0, max: 5000 },
    { label: '5,000 - 10,000', min: 5000, max: 10000 },
    { label: '10,000 - 20,000', min: 10000, max: 20000 },
    { label: '20,000 - 50,000', min: 20000, max: 50000 },
    { label: 'Over 50,000', min: 50000, max: Infinity },
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
  PHONE_PK: /^(\+92|0)?[0-9]{10}$/,
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
