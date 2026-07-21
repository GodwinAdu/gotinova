import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function check() {
  try {
    const client = await pool.connect()
    console.log('✅ Connected to database!\n')

    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)
    console.log(`📋 Tables (${tables.rows.length}):`)
    tables.rows.forEach((r: any) => console.log(`   - ${r.table_name}`))

    const users = await client.query('SELECT COUNT(*) FROM "user"')
    const products = await client.query('SELECT COUNT(*) FROM "products"')
    const orders = await client.query('SELECT COUNT(*) FROM "orders"')
    const categories = await client.query('SELECT COUNT(*) FROM "categories"')

    console.log(`\n📊 Data:`)
    console.log(`   Users: ${users.rows[0].count}`)
    console.log(`   Products: ${products.rows[0].count}`)
    console.log(`   Orders: ${orders.rows[0].count}`)
    console.log(`   Categories: ${categories.rows[0].count}`)

    client.release()
    console.log('\n✅ Database is working fine!')
  } catch (err: any) {
    console.error('❌ Database error:', err.message)
  } finally {
    await pool.end()
  }
}

check()
