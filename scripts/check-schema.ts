import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function check() {
  const res = await pool.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'account' ORDER BY ordinal_position"
  )
  console.log('Account table columns:', res.rows.map((r: any) => r.column_name))

  const res2 = await pool.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'user' ORDER BY ordinal_position"
  )
  console.log('User table columns:', res2.rows.map((r: any) => r.column_name))
  
  await pool.end()
}

check()
