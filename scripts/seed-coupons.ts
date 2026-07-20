import { Pool } from 'pg'
import { randomUUID } from 'crypto'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function seedCoupons() {
  const client = await pool.connect()
  console.log('🎫 Seeding coupons...\n')

  const coupons = [
    {
      code: 'WELCOME10',
      description: '10% off your first order',
      discountType: 'percentage',
      discountValue: 10,
      maxUses: 100,
      minOrderAmount: 200,
    },
    {
      code: 'LUXE20',
      description: '20% off orders above GH₵ 500',
      discountType: 'percentage',
      discountValue: 20,
      maxUses: 50,
      minOrderAmount: 500,
    },
    {
      code: 'FREEWIG',
      description: 'GH₵ 100 off any order',
      discountType: 'fixed',
      discountValue: 100,
      maxUses: 30,
      minOrderAmount: 300,
    },
    {
      code: 'HAIR50',
      description: 'GH₵ 50 off your next purchase',
      discountType: 'fixed',
      discountValue: 50,
      maxUses: null,
      minOrderAmount: null,
    },
  ]

  for (const coupon of coupons) {
    try {
      await client.query(
        `INSERT INTO "coupons" ("id", "code", "description", "discountType", "discountValue", "maxUses", "currentUses", "minOrderAmount", "isActive", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, 0, $7, true, NOW(), NOW())
         ON CONFLICT ("code") DO NOTHING`,
        [
          randomUUID(),
          coupon.code,
          coupon.description,
          coupon.discountType,
          coupon.discountValue,
          coupon.maxUses,
          coupon.minOrderAmount,
        ]
      )
      console.log(`   ✅ ${coupon.code} — ${coupon.description}`)
    } catch (err: any) {
      console.log(`   ⚠️  ${coupon.code}: ${err.message}`)
    }
  }

  console.log('\n🎉 Coupons seeded! Test codes:')
  console.log('   WELCOME10 — 10% off (min GH₵ 200)')
  console.log('   LUXE20    — 20% off (min GH₵ 500)')
  console.log('   FREEWIG   — GH₵ 100 off (min GH₵ 300)')
  console.log('   HAIR50    — GH₵ 50 off (no minimum)')
  console.log('')

  client.release()
  await pool.end()
}

seedCoupons()
