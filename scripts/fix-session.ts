import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function fix() {
  const client = await pool.connect()
  
  console.log('Fixing session table...')
  await client.query(`ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "token" TEXT`)
  await client.query(`ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "ipAddress" TEXT`)
  await client.query(`ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "userAgent" TEXT`)
  
  // Create unique index on token if not exists
  await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS "session_token_idx" ON "session"("token")`)
  
  console.log('✅ Session table fixed!')
  console.log('')
  console.log('Now restart your dev server (kill it and run npm run dev again)')
  console.log('Then try logging in with:')
  console.log('   Email: admin@luxehair.com')
  console.log('   Password: Admin@123456')
  
  client.release()
  await pool.end()
}

fix()
