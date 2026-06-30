import { z } from 'zod'

// Auth Schemas
export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
})

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const newPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Product Schemas
export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be positive'),
  originalPrice: z.number().positive().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
  sku: z.string().optional(),
})

// Order Schemas
export const orderSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Invalid phone number'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  zipCode: z.string().min(1, 'Zip code is required'),
  notes: z.string().optional(),
  paymentMethod: z.enum(['cod', 'advance']),
})

// Review Schema
export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().min(1, 'Title is required'),
  comment: z.string().min(10, 'Comment must be at least 10 characters'),
})

// Coupon Schema
export const couponSchema = z.object({
  code: z.string().min(3).max(20),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().positive(),
  maxUses: z.number().positive().optional(),
  minOrderAmount: z.number().optional(),
})

// Type exports
export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type ProductInput = z.infer<typeof productSchema>
export type OrderInput = z.infer<typeof orderSchema>
export type ReviewInput = z.infer<typeof reviewSchema>
export type CouponInput = z.infer<typeof couponSchema>
