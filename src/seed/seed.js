import bcrypt from 'bcryptjs'
import { connectDB, disconnectDB } from '../config/db.js'
import { env } from '../config/env.js'
import Admin from '../models/Admin.js'
import Resource from '../models/Resource.js'
import { RESOURCE_KEYS } from '../constants/resources.js'
import { INITIAL_STAFF } from './initialStaff.js'
import { logger } from '../utils/logger.js'

async function seed() {
  await connectDB()

  const passwordHash = await bcrypt.hash(env.adminPassword, 12)

  const admin = await Admin.findOneAndUpdate(
    { username: env.adminUsername.toLowerCase() },
    { username: env.adminUsername.toLowerCase(), passwordHash },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )

  logger.info(`Admin user ready: ${admin.username}`)

  for (const key of RESOURCE_KEYS) {
    const defaultItems = key === 'staff' ? INITIAL_STAFF : []
    await Resource.findOneAndUpdate(
      { key },
      { $setOnInsert: { items: defaultItems } },
      { upsert: true },
    )
    logger.info(`Resource ready: ${key}`)
  }

  logger.info('Database seed completed')
  await disconnectDB()
  process.exit(0)
}

seed().catch(async (error) => {
  logger.error('Seed failed', { message: error.message })
  await disconnectDB().catch(() => {})
  process.exit(1)
})
