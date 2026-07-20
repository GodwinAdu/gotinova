import { Pool } from 'pg'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

/**
 * Database Backup Script
 * 
 * Exports all important tables to JSON files for backup.
 * Run with: npx tsx --env-file=.env scripts/backup.ts
 * 
 * Schedule nightly with cron:
 *   0 2 * * * cd /path/to/project && npx tsx --env-file=.env scripts/backup.ts
 * 
 * Or use Vercel Cron Jobs / Railway Cron for hosted environments.
 */

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const TABLES = [
  'user',
  'orders',
  'orderItems',
  'products',
  'categories',
  'reviews',
  'coupons',
  'adminUsers',
]

async function backup() {
  const client = await pool.connect()
  const timestamp = new Date().toISOString().split('T')[0]
  const backupDir = join(process.cwd(), 'backups', timestamp)

  // Create backup directory
  if (!existsSync(join(process.cwd(), 'backups'))) {
    mkdirSync(join(process.cwd(), 'backups'))
  }
  if (!existsSync(backupDir)) {
    mkdirSync(backupDir)
  }

  console.log(`🗄️  Starting backup — ${timestamp}\n`)

  let totalRows = 0

  for (const table of TABLES) {
    try {
      const result = await client.query(`SELECT * FROM "${table}"`)
      const filePath = join(backupDir, `${table}.json`)
      writeFileSync(filePath, JSON.stringify(result.rows, null, 2))
      console.log(`   ✅ ${table}: ${result.rows.length} rows`)
      totalRows += result.rows.length
    } catch (err: any) {
      console.log(`   ⚠️  ${table}: ${err.message}`)
    }
  }

  // Backup summary
  const summaryPath = join(backupDir, '_summary.json')
  writeFileSync(summaryPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    tables: TABLES.length,
    totalRows,
    database: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'unknown',
  }, null, 2))

  console.log(`\n═══════════════════════════════════════════`)
  console.log(`✅ Backup complete!`)
  console.log(`   Location: ${backupDir}`)
  console.log(`   Tables: ${TABLES.length}`)
  console.log(`   Total rows: ${totalRows}`)
  console.log(`═══════════════════════════════════════════\n`)

  client.release()
  await pool.end()
}

backup()
