import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function check() {
  const client = await pool.connect()
  try {
    // Check reviews table columns
    const cols = await client.query(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'reviews' ORDER BY ordinal_position`
    )
    console.log('Reviews table columns:')
    cols.rows.forEach(r => console.log(`  ${r.column_name}: ${r.data_type}`))

    // Check constraints
    const constraints = await client.query(
      `SELECT conname, contype FROM pg_constraint WHERE conrelid = 'reviews'::regclass`
    )
    console.log('\nConstraints:')
    constraints.rows.forEach(r => console.log(`  ${r.conname}: ${r.contype}`))

    // Try a test insert
    console.log('\nTesting insert...')
    const testId = 'test-review-' + Date.now()
    
    // Get a user and product to test with
    const users = await client.query(`SELECT id FROM "user" LIMIT 1`)
    const prods = await client.query(`SELECT id FROM "products" LIMIT 1`)
    
    if (!users.rows.length || !prods.rows.length) {
      console.log('No users or products in DB to test with')
      return
    }

    const userId = users.rows[0].id
    const productId = prods.rows[0].id

    await client.query(
      `INSERT INTO "reviews" ("id", "userId", "productId", "rating", "title", "comment", "status", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
      [testId, userId, productId, 5, 'Test Review', 'This is a test review', 'approved']
    )
    console.log('✅ Test insert succeeded!')

    // Clean up
    await client.query(`DELETE FROM "reviews" WHERE id = $1`, [testId])
    console.log('✅ Cleaned up test review')
  } catch (err) {
    console.error('❌ Error:', err)
  } finally {
    client.release()
    await pool.end()
  }
}

check()
