-- Add product variants table
-- Run this migration to support product variants (size, color, etc.)

CREATE TABLE IF NOT EXISTS "productVariants" (
  "id" TEXT PRIMARY KEY,
  "productId" TEXT NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "options" TEXT NOT NULL,
  "price" DECIMAL(10,2) NOT NULL,
  "stock" INTEGER NOT NULL DEFAULT 0,
  "sku" TEXT,
  "image" TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_variants_product" ON "productVariants"("productId");
