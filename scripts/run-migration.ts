import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function migrate() {
  const client = await pool.connect()
  try {
    // Check if reviews table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'reviews'
      )
    `)
    
    if (!tableCheck.rows[0].exists) {
      console.log('Creating reviews table...')
      await client.query(`
        CREATE TABLE "reviews" (
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
        )
      `)
      console.log('✅ reviews table created')
    } else {
      console.log('✅ reviews table already exists')
    }

    // Also ensure user columns exist
    await client.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "phone" TEXT`)
    await client.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "shippingAddress" TEXT`)
    console.log('✅ user columns verified')

  } finally {
    client.release()
    await pool.end()
  }
}

migrate().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
