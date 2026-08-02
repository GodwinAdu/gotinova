-- Add phone and shippingAddress columns to user table
-- Run this once on your database

ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "shippingAddress" TEXT;
