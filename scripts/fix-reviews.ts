import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function fix() {
  const client = await pool.connect()
  try {
    const result = await client.query(`UPDATE "reviews" SET "status" = 'approved' WHERE "status" = 'pending'`)
    console.log(`✅ Updated ${result.rowCount} reviews from 'pending' to 'approved'`)
  } finally {
    client.release()
    await pool.end()
  }
}

fix()
