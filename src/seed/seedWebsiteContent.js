import { connectDB, disconnectDB } from '../config/db.js'
import Resource from '../models/Resource.js'
import { RESOURCE_KEYS } from '../constants/resources.js'
import { buildWebsiteSeedData } from './loadWebsiteConstants.js'
import { logger } from '../utils/logger.js'

const force = process.argv.includes('--force')
const onlyIfEmpty = !force

export async function seedWebsiteContent({ onlyIfEmpty: skipWhenPopulated = onlyIfEmpty } = {}) {
  const data = buildWebsiteSeedData()
  const summary = []

  for (const key of RESOURCE_KEYS) {
    const items = data[key]
    if (!Array.isArray(items)) {
      logger.warn(`No website seed data for resource: ${key}`)
      continue
    }

    const existing = await Resource.findOne({ key }).select('items').lean()
    const hasItems = Array.isArray(existing?.items) && existing.items.length > 0

    if (skipWhenPopulated && hasItems) {
      logger.info(`Skipped ${key} — ${existing.items.length} item(s) already in database`)
      summary.push({ key, action: 'skipped', count: existing.items.length })
      continue
    }

    await Resource.findOneAndUpdate(
      { key },
      { $set: { items } },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true },
    )

    logger.info(`Seeded ${key}: ${items.length} item(s) from website constants`)
    summary.push({ key, action: 'seeded', count: items.length })
  }

  return summary
}

async function runCli() {
  await connectDB()

  try {
    const summary = await seedWebsiteContent({ onlyIfEmpty })
    const seeded = summary.filter((row) => row.action === 'seeded').length
    const skipped = summary.filter((row) => row.action === 'skipped').length

    logger.info('Website content seed finished', {
      mode: force ? 'force' : 'only-if-empty',
      seeded,
      skipped,
    })

    if (skipped > 0 && !force) {
      logger.info('Re-run with --force to overwrite existing CMS data from website constants')
    }
  } finally {
    await disconnectDB()
  }

  process.exit(0)
}

const isDirectRun = process.argv[1]?.includes('seedWebsiteContent.js')
if (isDirectRun) {
  runCli().catch(async (error) => {
    logger.error('Website content seed failed', { message: error.message })
    await disconnectDB().catch(() => {})
    process.exit(1)
  })
}
