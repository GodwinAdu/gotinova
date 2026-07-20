import { Pool } from 'pg'
import { hash } from '@node-rs/bcrypt'
import { randomUUID } from 'crypto'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set. Please add it to your .env file.')
  process.exit(1)
}

const pool = new Pool({ connectionString: DATABASE_URL })

async function seed() {
  const client = await pool.connect()
  console.log('🔌 Connected to database\n')

  try {
    // ==========================================
    // 1. Create tables
    // ==========================================
    console.log('📦 Creating tables...')
    await client.query(`
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
    `)
    console.log('✅ Tables created\n')

    // ==========================================
    // 2. Seed Admin User
    // ==========================================
    console.log('👤 Creating admin user...')
    const adminId = randomUUID()
    const adminEmail = 'admin@gotinova.com'
    const adminPassword = 'Admin@123456'
    const hashedPassword = await hash(adminPassword, 10)

    // Insert user
    await client.query(`
      INSERT INTO "user" ("id", "email", "emailVerified", "name", "createdAt", "updatedAt")
      VALUES ($1, $2, true, 'Admin', NOW(), NOW())
      ON CONFLICT ("email") DO UPDATE SET "name" = 'Admin'
      RETURNING "id"
    `, [adminId, adminEmail])

    // Get the actual user ID (in case it already existed)
    const adminResult = await client.query(`SELECT "id" FROM "user" WHERE "email" = $1`, [adminEmail])
    const actualAdminId = adminResult.rows[0].id

    // Insert credential account (this is how better-auth stores passwords)
    await client.query(`
      INSERT INTO "account" ("id", "userId", "accountId", "provider", "providerAccountId", "accessToken", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, 'credential', $4, $5, NOW(), NOW())
      ON CONFLICT ("provider", "providerAccountId") DO UPDATE SET "accessToken" = $5
    `, [randomUUID(), actualAdminId, actualAdminId, adminEmail, hashedPassword])

    // Assign admin role
    await client.query(`
      INSERT INTO "adminUsers" ("id", "userId", "role", "permissions", "isActive", "createdAt", "updatedAt")
      VALUES ($1, $2, 'admin', '["manage_products","manage_orders","manage_customers","manage_analytics"]', true, NOW(), NOW())
      ON CONFLICT ("userId") DO NOTHING
    `, [randomUUID(), actualAdminId])

    console.log(`✅ Admin created: ${adminEmail} / ${adminPassword}\n`)

    // ==========================================
    // 3. Seed Demo Customer
    // ==========================================
    console.log('👤 Creating demo customer...')
    const customerId = randomUUID()
    const customerEmail = 'customer@gotinova.com'
    const customerPassword = 'Customer@123'
    const customerHash = await hash(customerPassword, 10)

    await client.query(`
      INSERT INTO "user" ("id", "email", "emailVerified", "name", "createdAt", "updatedAt")
      VALUES ($1, $2, true, 'Demo Customer', NOW(), NOW())
      ON CONFLICT ("email") DO UPDATE SET "name" = 'Demo Customer'
    `, [customerId, customerEmail])

    const customerResult = await client.query(`SELECT "id" FROM "user" WHERE "email" = $1`, [customerEmail])
    const actualCustomerId = customerResult.rows[0].id

    await client.query(`
      INSERT INTO "account" ("id", "userId", "accountId", "provider", "providerAccountId", "accessToken", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, 'credential', $4, $5, NOW(), NOW())
      ON CONFLICT ("provider", "providerAccountId") DO UPDATE SET "accessToken" = $5
    `, [randomUUID(), actualCustomerId, actualCustomerId, customerEmail, customerHash])

    console.log(`✅ Customer created: ${customerEmail} / ${customerPassword}\n`)

    // ==========================================
    // 4. Seed Categories
    // ==========================================
    console.log('📁 Creating categories...')
    const cats = [
      { name: 'Human Hair Wigs', desc: 'Premium 100% human hair wigs', slug: 'human-hair-wigs' },
      { name: 'Synthetic Wigs', desc: 'Durable and affordable synthetic options', slug: 'synthetic-wigs' },
      { name: 'Lace Front', desc: 'Natural-looking lace front wigs', slug: 'lace-front' },
      { name: 'Braiding Hair', desc: 'Hair for braiding and protective styles', slug: 'braiding-hair' },
      { name: 'Extensions', desc: 'Clip-in and sew-in hair extensions', slug: 'extensions' },
      { name: 'Closures & Frontals', desc: 'HD lace closures and frontals', slug: 'closures-frontals' },
    ]

    const catIds: Record<string, string> = {}
    for (const cat of cats) {
      const catId = randomUUID()
      await client.query(`
        INSERT INTO "categories" ("id", "name", "description", "slug", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        ON CONFLICT ("slug") DO NOTHING
      `, [catId, cat.name, cat.desc, cat.slug])
      catIds[cat.slug] = catId
    }

    // Fetch actual IDs (in case they already existed)
    const catResult = await client.query(`SELECT "id", "slug" FROM "categories"`)
    for (const row of catResult.rows) {
      catIds[row.slug] = row.id
    }
    console.log(`✅ ${catResult.rows.length} categories ready\n`)

    // ==========================================
    // 5. Seed Products (GH₵ prices)
    // ==========================================
    console.log('🛍️  Creating products...')
    const prods = [
      { name: 'Premium 24" Human Hair Wig', desc: 'Beautiful 24-inch 100% human hair wig with natural wave. Perfect for everyday elegance.', price: 1899.99, original: 2499.99, cat: 'human-hair-wigs', stock: 15 },
      { name: 'HD Lace Front 20" Wig', desc: 'Natural-looking HD lace front wig with an undetectable hairline. Baby hair included.', price: 2499.99, original: 3499.99, cat: 'lace-front', stock: 8 },
      { name: 'Synthetic Straight Wig 18"', desc: 'Heat-resistant synthetic wig that holds style beautifully. Low maintenance.', price: 599.99, original: 899.99, cat: 'synthetic-wigs', stock: 25 },
      { name: 'Curly Braiding Hair Pack (3pcs)', desc: 'Premium crochet braiding hair for protective styles. Soft and tangle-free.', price: 249.99, original: 349.99, cat: 'braiding-hair', stock: 40 },
      { name: 'Premium Clip-in Extensions 16"', desc: 'Seamless clip-in extensions for instant length and volume. 100% human hair.', price: 1299.99, original: 1799.99, cat: 'extensions', stock: 12 },
      { name: 'Luxury Body Wave Wig 26"', desc: 'Gorgeous body wave 26-inch wig with premium virgin hair. Salon quality finish.', price: 3199.99, original: 4499.99, cat: 'human-hair-wigs', stock: 6 },
      { name: '5x5 HD Lace Closure', desc: 'Invisible HD lace closure with pre-plucked hairline and baby hair.', price: 899.99, original: 1199.99, cat: 'closures-frontals', stock: 20 },
      { name: 'Water Wave Wig 22"', desc: 'Stunning water wave pattern wig. Glueless, ready to wear. 180% density.', price: 1599.99, original: 2199.99, cat: 'human-hair-wigs', stock: 10 },
      { name: 'Kinky Straight Wig 14"', desc: 'Natural-looking kinky straight texture. Perfect for a low-maintenance everyday look.', price: 999.99, original: 1399.99, cat: 'synthetic-wigs', stock: 18 },
      { name: '13x4 Lace Frontal', desc: 'Full 13x4 HD lace frontal. Ear to ear coverage with natural hairline.', price: 1199.99, original: 1599.99, cat: 'closures-frontals', stock: 14 },
    ]

    let prodCount = 0
    for (const prod of prods) {
      const catId = catIds[prod.cat]
      if (!catId) continue

      await client.query(`
        INSERT INTO "products" ("id", "name", "description", "price", "originalPrice", "categoryId", "stock", "sku", "rating", "reviewCount", "isActive", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, NOW(), NOW())
        ON CONFLICT ("sku") DO NOTHING
      `, [
        randomUUID(),
        prod.name,
        prod.desc,
        prod.price,
        prod.original,
        catId,
        prod.stock,
        `SKU-${Date.now().toString(36).toUpperCase()}-${(++prodCount).toString().padStart(3, '0')}`,
        (Math.random() * 1.5 + 3.5).toFixed(2),
        Math.floor(Math.random() * 50) + 5,
      ])
    }
    console.log(`✅ ${prodCount} products created\n`)

    // ==========================================
    // Done!
    // ==========================================
    console.log('═══════════════════════════════════════════')
    console.log('🎉 Database seeded successfully!')
    console.log('═══════════════════════════════════════════')
    console.log('')
    console.log('🔑 Login Credentials:')
    console.log('─────────────────────')
    console.log(`   Admin:    ${adminEmail} / ${adminPassword}`)
    console.log(`   Customer: ${customerEmail} / ${customerPassword}`)
    console.log('')
    console.log('🌐 Start the dev server: npm run dev')
    console.log('   Then visit: http://localhost:3000/sign-in')
    console.log('')

  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

seed()
