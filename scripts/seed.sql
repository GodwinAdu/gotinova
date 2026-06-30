-- LuxeHair Database Seed Script
-- Run this to populate with admin account and demo data

-- ============================================
-- 1. CREATE ADMIN USER
-- ============================================
INSERT INTO "user" ("id", "email", "emailVerified", "name", "createdAt", "updatedAt")
VALUES (
  'admin-user-001',
  'admin@luxehair.com',
  true,
  'Admin User',
  NOW(),
  NOW()
)
ON CONFLICT ("email") DO NOTHING;

-- ============================================
-- 2. CREATE DEMO CUSTOMER
-- ============================================
INSERT INTO "user" ("id", "email", "emailVerified", "name", "createdAt", "updatedAt")
VALUES (
  'customer-user-001',
  'customer@luxehair.com',
  true,
  'Demo Customer',
  NOW(),
  NOW()
)
ON CONFLICT ("email") DO NOTHING;

-- ============================================
-- 3. REGISTER ADMIN ROLE
-- ============================================
INSERT INTO "adminUsers" ("id", "userId", "role", "permissions", "isActive", "createdAt", "updatedAt")
VALUES (
  'admin-record-001',
  'admin-user-001',
  'admin',
  '["manage_products", "manage_orders", "manage_customers", "manage_analytics"]',
  true,
  NOW(),
  NOW()
)
ON CONFLICT ("userId") DO NOTHING;

-- ============================================
-- 4. CREATE PRODUCT CATEGORIES
-- ============================================
INSERT INTO "categories" ("id", "name", "description", "slug", "createdAt", "updatedAt")
VALUES
  ('cat-001', 'Human Hair Wigs', 'Premium human hair wigs', 'human-hair-wigs', NOW(), NOW()),
  ('cat-002', 'Synthetic Wigs', 'Durable synthetic hair options', 'synthetic-wigs', NOW(), NOW()),
  ('cat-003', 'Lace Front', 'Natural-looking lace front wigs', 'lace-front', NOW(), NOW()),
  ('cat-004', 'Braiding Hair', 'Hair for braiding styles', 'braiding-hair', NOW(), NOW()),
  ('cat-005', 'Extensions', 'Hair extensions and pieces', 'extensions', NOW(), NOW())
ON CONFLICT ("slug") DO NOTHING;

-- ============================================
-- 5. CREATE DEMO PRODUCTS
-- ============================================
INSERT INTO "products" ("id", "name", "description", "price", "originalPrice", "categoryId", "stock", "sku", "rating", "reviewCount", "isActive", "createdAt", "updatedAt")
VALUES
  (
    'prod-001',
    'Premium 24" Human Hair Wig',
    'Beautiful 24-inch 100% human hair wig with natural wave. Perfect for everyday wear.',
    '189.99',
    '249.99',
    'cat-001',
    15,
    'SKU-HHW-001',
    '4.5',
    23,
    true,
    NOW(),
    NOW()
  ),
  (
    'prod-002',
    'Lace Front 20" Wig',
    'Natural-looking lace front wig that provides an undetectable hairline.',
    '249.99',
    '349.99',
    'cat-003',
    8,
    'SKU-LF-001',
    '4.8',
    45,
    true,
    NOW(),
    NOW()
  ),
  (
    'prod-003',
    'Synthetic Straight Wig 18"',
    'Durable synthetic hair wig that holds style. Low maintenance and affordable.',
    '59.99',
    '89.99',
    'cat-002',
    25,
    'SKU-SYN-001',
    '4.2',
    18,
    true,
    NOW(),
    NOW()
  ),
  (
    'prod-004',
    'Curly Braiding Hair Pack',
    'High-quality braiding hair suitable for protective styles.',
    '24.99',
    '34.99',
    'cat-004',
    40,
    'SKU-BH-001',
    '4.6',
    32,
    true,
    NOW(),
    NOW()
  ),
  (
    'prod-005',
    'Premium Hair Extensions 16"',
    'Seamless hair extensions for length and volume. 100% human hair.',
    '129.99',
    '179.99',
    'cat-005',
    12,
    'SKU-EXT-001',
    '4.7',
    28,
    true,
    NOW(),
    NOW()
  ),
  (
    'prod-006',
    'Luxury Wig 26" Wavy',
    'Gorgeous wavy 26-inch wig with premium human hair. Salon quality.',
    '319.99',
    '449.99',
    'cat-001',
    6,
    'SKU-HHW-002',
    '4.9',
    52,
    true,
    NOW(),
    NOW()
  )
ON CONFLICT ("sku") DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Verify admin user created:
SELECT COUNT(*) as admin_count FROM "user" WHERE email = 'admin@luxehair.com';

-- Verify admin role assigned:
SELECT COUNT(*) as admin_role_count FROM "adminUsers" WHERE role = 'admin';

-- Verify categories created:
SELECT COUNT(*) as category_count FROM "categories";

-- Verify products created:
SELECT COUNT(*) as product_count FROM "products";

-- Show admin credentials:
SELECT email, name FROM "user" WHERE id = 'admin-user-001';
SELECT email, name FROM "user" WHERE id = 'customer-user-001';
