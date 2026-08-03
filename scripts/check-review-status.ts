import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function check() {
  const client = await pool.connect()
  try {
    const result = await client.query(`SELECT id, "productId", rating, title, status, "createdAt" FROM reviews ORDER BY "createdAt" DESC LIMIT 10`)
    console.log('Recent reviews:')
    result.rows.forEach(r => console.log(`  [${r.status}] rating:${r.rating} title:"${r.title}" product:${r.productId}`))
    
    if (result.rows.length === 0) {
      console.log('  No reviews found in database!')
    }
  } finally {
    client.release()
    await pool.end()
  }
}

check()
