import { Pool } from 'pg'
import { hash, verify } from '@node-rs/bcrypt'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function debug() {
  const client = await pool.connect()

  // Show account data
  const accounts = await client.query(`
    SELECT u."email", a."provider", a."providerAccountId", a."accountId",
           LEFT(a."password", 15) as pw_prefix,
           LENGTH(a."password") as pw_length
    FROM "account" a
    JOIN "user" u ON u."id" = a."userId"
    WHERE a."provider" = 'credential'
  `)
  console.log('\n📋 Credential accounts in DB:')
  console.table(accounts.rows)

  // Test password verification
  const adminAccount = await client.query(`
    SELECT a."password" FROM "account" a
    JOIN "user" u ON u."id" = a."userId"
    WHERE u."email" = 'admin@luxehair.com' AND a."provider" = 'credential'
  `)

  if (adminAccount.rows.length > 0 && adminAccount.rows[0].password) {
    const storedHash = adminAccount.rows[0].password
    console.log('\n🔐 Testing password verification:')
    console.log('   Hash starts with:', storedHash.substring(0, 7))
    
    const isValid = await verify('Admin@123456', storedHash)
    console.log('   "Admin@123456" matches:', isValid)
  } else {
    console.log('\n❌ No password found for admin account!')
    
    // Show raw account data
    const raw = await client.query(`
      SELECT * FROM "account" a
      JOIN "user" u ON u."id" = a."userId"
      WHERE u."email" = 'admin@luxehair.com'
    `)
    console.log('Raw data:', JSON.stringify(raw.rows[0], null, 2))
  }

  // Also test what better-auth would do: it looks up by email first
  const userLookup = await client.query(`
    SELECT "id", "email" FROM "user" WHERE "email" = 'admin@luxehair.com'
  `)
  console.log('\n👤 User lookup:', userLookup.rows)

  if (userLookup.rows.length > 0) {
    const userId = userLookup.rows[0].id
    const accountLookup = await client.query(`
      SELECT "id", "provider", "accountId", "providerAccountId", 
             "password" IS NOT NULL as has_pw,
             LENGTH("password") as pw_len
      FROM "account" WHERE "userId" = $1
    `, [userId])
    console.log('📋 Accounts for this user:', accountLookup.rows)
  }

  client.release()
  await pool.end()
}

debug()
