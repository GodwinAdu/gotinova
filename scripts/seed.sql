-- ============================================
-- LuxeHair Database Setup
-- Run this once to create all tables and seed demo data
-- ============================================

-- ============================================
-- BETTER AUTH TABLES (authentication)
-- ============================================
CREATE TABLE IF NOT EXISTS "user" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  "name" TEXT,
  "image" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "session" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "account" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "accountId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refreshToken" TEXT,
  "accessToken" TEXT,
  "expiresAt" INTEGER,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE("provider", "providerAccountId")
);

CREATE TABLE IF NOT EXISTS "verification" (
  "id" TEXT PRIMARY KEY,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================
-- APP TABLES
-- ============================================
CREATE TABLE IF NOT EXISTS "categories" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "image" TEXT,
  "slug" TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "products" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "price" DECIMAL(10,2) NOT NULL,
  "originalPrice" DECIMAL(10,2),
  "categoryId" TEXT NOT NULL REFERENCES "categories"("id") ON DELETE CASCADE,
  "stock" INTEGER NOT NULL DEFAULT 0,
  "image" TEXT,
  "images" TEXT,
  "sku" TEXT UNIQUE,
  "rating" DECIMAL(3,2) DEFAULT 0,
  "reviewCount" INTEGER DEFAULT 0,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "productAttributes" (
  "id" TEXT PRIMARY KEY,
  "productId" TEXT NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "cartItems" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "productId" TEXT NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE("userId", "productId")
);

CREATE TABLE IF NOT EXISTS "wishlistItems" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "productId" TEXT NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE("userId", "productId")
);

CREATE TABLE IF NOT EXISTS "orders" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "orderNumber" TEXT NOT NULL UNIQUE,
  "totalAmount" DECIMAL(12,2) NOT NULL,
  "subtotal" DECIMAL(12,2) NOT NULL,
  "shippingCost" DECIMAL(10,2) DEFAULT 0,
  "tax" DECIMAL(10,2) DEFAULT 0,
  "discountAmount" DECIMAL(10,2) DEFAULT 0,
  "status" TEXT DEFAULT 'pending',
  "paymentStatus" TEXT DEFAULT 'pending',
  "paymentMethod" TEXT,
  "shippingAddress" TEXT,
  "billingAddress" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "orderItems" (
  "id" TEXT PRIMARY KEY,
  "orderId" TEXT NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
  "productId" TEXT,
  "productName" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "price" DECIMAL(10,2) NOT NULL,
  "subtotal" DECIMAL(12,2) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "reviews" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "productId" TEXT NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "rating" INTEGER NOT NULL,
  "title" TEXT,
  "comment" TEXT,
  "images" TEXT,
  "verified" BOOLEAN DEFAULT false,
  "helpful" INTEGER DEFAULT 0,
  "status" TEXT DEFAULT 'pending',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "deliveryTracking" (
  "id" TEXT PRIMARY KEY,
  "orderId" TEXT NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
  "trackingNumber" TEXT UNIQUE,
  "carrier" TEXT,
  "status" TEXT DEFAULT 'pending',
  "currentLocation" TEXT,
  "estimatedDelivery" TIMESTAMP,
  "actualDelivery" TIMESTAMP,
  "events" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "coupons" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "discountType" TEXT NOT NULL,
  "discountValue" DECIMAL(10,2) NOT NULL,
  "maxUses" INTEGER,
  "currentUses" INTEGER DEFAULT 0,
  "minOrderAmount" DECIMAL(10,2),
  "validFrom" TIMESTAMP,
  "validTo" TIMESTAMP,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "analytics" (
  "id" TEXT PRIMARY KEY,
  "date" DATE NOT NULL UNIQUE,
  "totalRevenue" DECIMAL(12,2) DEFAULT 0,
  "totalOrders" INTEGER DEFAULT 0,
  "totalCustomers" INTEGER DEFAULT 0,
  "newCustomers" INTEGER DEFAULT 0,
  "averageOrderValue" DECIMAL(10,2) DEFAULT 0,
  "conversionRate" DECIMAL(5,2) DEFAULT 0,
  "data" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "frequentlyBoughtTogether" (
  "id" TEXT PRIMARY KEY,
  "productId" TEXT NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "relatedProductId" TEXT NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "score" DECIMAL(5,2) DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE("productId", "relatedProductId")
);

CREATE TABLE IF NOT EXISTS "adminUsers" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE REFERENCES "user"("id") ON DELETE CASCADE,
  "role" TEXT NOT NULL DEFAULT 'admin',
  "permissions" TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================
-- SEED DATA
-- ============================================

-- Categories
INSERT INTO "categories" ("id", "name", "description", "slug", "createdAt", "updatedAt")
VALUES
  ('cat-001', 'Human Hair Wigs', 'Premium 100% human hair wigs', 'human-hair-wigs', NOW(), NOW()),
  ('cat-002', 'Synthetic Wigs', 'Durable and affordable synthetic options', 'synthetic-wigs', NOW(), NOW()),
  ('cat-003', 'Lace Front', 'Natural-looking lace front wigs', 'lace-front', NOW(), NOW()),
  ('cat-004', 'Braiding Hair', 'Hair for braiding and protective styles', 'braiding-hair', NOW(), NOW()),
  ('cat-005', 'Extensions', 'Clip-in and sew-in hair extensions', 'extensions', NOW(), NOW()),
  ('cat-006', 'Closures & Frontals', 'HD lace closures and frontals', 'closures-frontals', NOW(), NOW())
ON CONFLICT ("slug") DO NOTHING;

-- Products (prices in GH₵)
INSERT INTO "products" ("id", "name", "description", "price", "originalPrice", "categoryId", "stock", "sku", "rating", "reviewCount", "isActive", "createdAt", "updatedAt")
VALUES
  ('prod-001', 'Premium 24" Human Hair Wig', 'Beautiful 24-inch 100% human hair wig with natural wave. Perfect for everyday elegance.', '1899.99', '2499.99', 'cat-001', 15, 'SKU-HHW-001', '4.50', 23, true, NOW(), NOW()),
  ('prod-002', 'Lace Front 20" Wig', 'Natural-looking HD lace front wig with an undetectable hairline. Baby hair included.', '2499.99', '3499.99', 'cat-003', 8, 'SKU-LF-001', '4.80', 45, true, NOW(), NOW()),
  ('prod-003', 'Synthetic Straight Wig 18"', 'Heat-resistant synthetic wig that holds style beautifully. Low maintenance.', '599.99', '899.99', 'cat-002', 25, 'SKU-SYN-001', '4.20', 18, true, NOW(), NOW()),
  ('prod-004', 'Curly Braiding Hair Pack', 'Premium braiding hair for crochet and protective styles. 3 packs included.', '249.99', '349.99', 'cat-004', 40, 'SKU-BH-001', '4.60', 32, true, NOW(), NOW()),
  ('prod-005', 'Premium Clip-in Extensions 16"', 'Seamless clip-in extensions for instant length and volume. 100% human hair.', '1299.99', '1799.99', 'cat-005', 12, 'SKU-EXT-001', '4.70', 28, true, NOW(), NOW()),
  ('prod-006', 'Luxury Wig 26" Body Wave', 'Gorgeous body wave 26-inch wig with premium virgin hair. Salon quality finish.', '3199.99', '4499.99', 'cat-001', 6, 'SKU-HHW-002', '4.90', 52, true, NOW(), NOW()),
  ('prod-007', '5x5 HD Lace Closure', 'Invisible HD lace closure with pre-plucked hairline and baby hair.', '899.99', '1199.99', 'cat-006', 20, 'SKU-CL-001', '4.40', 15, true, NOW(), NOW()),
  ('prod-008', 'Water Wave Wig 22"', 'Stunning water wave pattern wig. Glueless, ready to wear.', '1599.99', '2199.99', 'cat-001', 10, 'SKU-HHW-003', '4.60', 19, true, NOW(), NOW())
ON CONFLICT ("sku") DO NOTHING;

-- Done!
SELECT 'Database setup complete!' AS status;
SELECT COUNT(*) AS total_categories FROM "categories";
SELECT COUNT(*) AS total_products FROM "products";
