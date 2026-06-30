import { db } from '@/lib/db'
import { user, adminUsers, categories, products } from '@/lib/db/schema'
import { hash } from '@node-rs/bcrypt'
import { v4 as uuid } from 'uuid'

async function seed() {
  console.log('Starting database seed...')

  try {
    // 1. Create admin user
    console.log('Creating admin user...')
    const adminPassword = await hash('Admin@123456', 10)
    const adminId = uuid()

    const adminUser = await db
      .insert(user)
      .values({
        id: adminId,
        email: 'admin@luxehair.com',
        emailVerified: true,
        name: 'Admin User',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoNothing()
      .returning()

    console.log('Admin user created:', adminUser)

    // 2. Create admin record
    console.log('Registering admin role...')
    const adminRecord = await db
      .insert(adminUsers)
      .values({
        id: uuid(),
        userId: adminId,
        role: 'admin',
        permissions: JSON.stringify(['manage_products', 'manage_orders', 'manage_customers', 'manage_analytics']),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoNothing()
      .returning()

    console.log('Admin role assigned:', adminRecord)

    // 3. Create demo user
    console.log('Creating demo customer...')
    const demoUserId = uuid()
    const demoUser = await db
      .insert(user)
      .values({
        id: demoUserId,
        email: 'customer@luxehair.com',
        emailVerified: true,
        name: 'Demo Customer',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoNothing()
      .returning()

    console.log('Demo customer created:', demoUser)

    // 4. Create categories
    console.log('Creating product categories...')
    const categoryData = [
      { name: 'Human Hair Wigs', description: 'Premium human hair wigs' },
      { name: 'Synthetic Wigs', description: 'Durable synthetic hair options' },
      { name: 'Lace Front', description: 'Natural-looking lace front wigs' },
      { name: 'Braiding Hair', description: 'Hair for braiding styles' },
      { name: 'Extensions', description: 'Hair extensions and pieces' },
    ]

    const createdCategories = []
    for (const cat of categoryData) {
      const categoryId = uuid()
      const slug = cat.name.toLowerCase().replace(/\s+/g, '-')

      const categoryResult = await db
        .insert(categories)
        .values({
          id: categoryId,
          name: cat.name,
          description: cat.description,
          slug,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoNothing()
        .returning()

      if (categoryResult.length > 0) {
        createdCategories.push(categoryResult[0])
      }
    }

    console.log(`Created ${createdCategories.length} categories`)

    // 5. Create demo products
    console.log('Creating demo products...')
    const productData = [
      {
        name: 'Premium 24" Human Hair Wig',
        description: 'Beautiful 24-inch 100% human hair wig with natural wave. Perfect for everyday wear.',
        price: 189.99,
        originalPrice: 249.99,
        categoryId: createdCategories[0]?.id,
        stock: 15,
      },
      {
        name: 'Lace Front 20" Wig',
        description: 'Natural-looking lace front wig that provides an undetectable hairline.',
        price: 249.99,
        originalPrice: 349.99,
        categoryId: createdCategories[2]?.id,
        stock: 8,
      },
      {
        name: 'Synthetic Straight Wig 18"',
        description: 'Durable synthetic hair wig that holds style. Low maintenance and affordable.',
        price: 59.99,
        originalPrice: 89.99,
        categoryId: createdCategories[1]?.id,
        stock: 25,
      },
      {
        name: 'Curly Braiding Hair Pack',
        description: 'High-quality braiding hair suitable for protective styles.',
        price: 24.99,
        originalPrice: 34.99,
        categoryId: createdCategories[3]?.id,
        stock: 40,
      },
      {
        name: 'Premium Hair Extensions 16"',
        description: 'Seamless hair extensions for length and volume. 100% human hair.',
        price: 129.99,
        originalPrice: 179.99,
        categoryId: createdCategories[4]?.id,
        stock: 12,
      },
      {
        name: 'Luxury Wig 26" Wavy',
        description: 'Gorgeous wavy 26-inch wig with premium human hair. Salon quality.',
        price: 319.99,
        originalPrice: 449.99,
        categoryId: createdCategories[0]?.id,
        stock: 6,
      },
    ]

    let productCount = 0
    for (const prod of productData) {
      if (!prod.categoryId) continue

      const productId = uuid()
      const sku = `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      const productResult = await db
        .insert(products)
        .values({
          id: productId,
          name: prod.name,
          description: prod.description,
          price: prod.price.toString(),
          originalPrice: prod.originalPrice.toString(),
          categoryId: prod.categoryId,
          stock: prod.stock,
          sku,
          rating: (Math.random() * 2 + 3.5).toString(), // 3.5-5.5 rating
          reviewCount: Math.floor(Math.random() * 50) + 5,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoNothing()
        .returning()

      if (productResult.length > 0) {
        productCount++
      }
    }

    console.log(`Created ${productCount} demo products`)

    console.log('✅ Database seed completed successfully!')
    console.log('\n📋 Default Credentials:')
    console.log('Admin Email: admin@luxehair.com')
    console.log('Admin Password: Admin@123456')
    console.log('\nCustomer Email: customer@luxehair.com')
    console.log('(Customer account created without password for demo)\n')

  } catch (error) {
    console.error('Seed error:', error)
    process.exit(1)
  }
}

seed()
