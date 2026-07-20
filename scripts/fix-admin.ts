import { Pool } from 'pg'

/**
 * Fix the account table schema to match what better-auth v1.6+ expects,
 * then create admin/customer users using better-auth's internal API.
 */

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function main() {
  const client = await pool.connect()
  console.log('🔌 Connected to database\n')

  // Step 1: Fix the account table schema
  console.log('🔧 Fixing account table schema for better-auth v1.6+...')
  
  // Add missing columns that better-auth expects
  const alterStatements = [
    `ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "providerId" TEXT`,
    `ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "password" TEXT`,
    `ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "accessTokenExpiresAt" TIMESTAMP`,
    `ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "refreshTokenExpiresAt" TIMESTAMP`,
    `ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "scope" TEXT`,
    `ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "idToken" TEXT`,
    `ALTER TABLE "account" ALTER COLUMN "provider" DROP NOT NULL`,
    `ALTER TABLE "account" ALTER COLUMN "providerAccountId" DROP NOT NULL`,
  ]

  for (const stmt of alterStatements) {
    try {
      await client.query(stmt)
    } catch (e: any) {
      // Ignore if column already exists
    }
  }

  // Copy data from "provider" to "providerId" for existing rows
  await client.query(`UPDATE "account" SET "providerId" = "provider" WHERE "providerId" IS NULL AND "provider" IS NOT NULL`)
  
  console.log('   ✅ Schema updated\n')

  // Also fix user table - better-auth might need additional columns
  const userAlter = [
    `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "role" TEXT`,
    `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "banned" BOOLEAN DEFAULT false`,
    `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "banReason" TEXT`,
    `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "banExpires" TIMESTAMP`,
  ]
  for (const stmt of userAlter) {
    try { await client.query(stmt) } catch {}
  }

  // Step 2: Clean existing test users
  const adminEmail = 'admin@gotinova.com'
  const adminPassword = 'Admin@123456'
  const customerEmail = 'customer@gotinova.com'
  const customerPassword = 'Customer@123'

  console.log('🧹 Cleaning old test accounts...')
  const existing = await client.query(
    `SELECT "id" FROM "user" WHERE "email" IN ($1, $2)`, [adminEmail, customerEmail]
  )
  for (const row of existing.rows) {
    await client.query(`DELETE FROM "adminUsers" WHERE "userId" = $1`, [row.id])
    await client.query(`DELETE FROM "account" WHERE "userId" = $1`, [row.id])
    await client.query(`DELETE FROM "session" WHERE "userId" = $1`, [row.id])
  }
  await client.query(`DELETE FROM "user" WHERE "email" IN ($1, $2)`, [adminEmail, customerEmail])
  console.log('   Done\n')

  // Step 3: Create users via better-auth internal API
  console.log('👤 Creating users via better-auth...')
  
  const { auth } = await import('../lib/auth')

  try {
    await auth.api.signUpEmail({
      body: { email: adminEmail, password: adminPassword, name: 'Admin' },
    })
    console.log(`   ✅ Admin: ${adminEmail} / ${adminPassword}`)
  } catch (err: any) {
    console.log(`   ❌ Admin: ${err.message || JSON.stringify(err)}`)
  }

  try {
    await auth.api.signUpEmail({
      body: { email: customerEmail, password: customerPassword, name: 'Demo Customer' },
    })
    console.log(`   ✅ Customer: ${customerEmail} / ${customerPassword}`)
  } catch (err: any) {
    console.log(`   ❌ Customer: ${err.message || JSON.stringify(err)}`)
  }

  // Step 4: Assign admin role
  console.log('\n🔑 Assigning admin role...')
  const adminUser = await client.query(`SELECT "id" FROM "user" WHERE "email" = $1`, [adminEmail])
  if (adminUser.rows.length > 0) {
    await client.query(
      `INSERT INTO "adminUsers" ("id", "userId", "role", "isActive", "createdAt", "updatedAt")
       VALUES (gen_random_uuid()::text, $1, 'admin', true, NOW(), NOW())
       ON CONFLICT ("userId") DO NOTHING`,
      [adminUser.rows[0].id]
    )
    console.log('   ✅ Done')
  }

  // Verify
  console.log('\n📋 Final check:')
  const check = await client.query(`
    SELECT u."email", a."providerId", a."password" IS NOT NULL as has_pw
    FROM "user" u JOIN "account" a ON a."userId" = u."id"
    WHERE u."email" IN ($1, $2)
  `, [adminEmail, customerEmail])
  check.rows.forEach((r: any) => console.log(`   ${r.email}: providerId=${r.providerId}, has_pw=${r.has_pw}`))

  console.log('\n═══════════════════════════════════════════')
  console.log('🎉 All set! Restart dev server and log in.')
  console.log('═══════════════════════════════════════════')
  console.log(`   Admin:    ${adminEmail} / ${adminPassword}`)
  console.log(`   Customer: ${customerEmail} / ${customerPassword}`)
  console.log('')

  client.release()
  await pool.end()
  process.exit(0)
}

main()
