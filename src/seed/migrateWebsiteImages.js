import { connectDB, disconnectDB } from '../config/db.js'
import { env } from '../config/env.js'
import { migratePresentWebsiteImages } from './resolveCmsAssets.js'
import { seedWebsiteContent } from './seedWebsiteContent.js'
import { logger } from '../utils/logger.js'

const updateDb = process.argv.includes('--update-db')

async function run() {
  const { copied, missing, backendUploadDir } = migratePresentWebsiteImages(env.uploadDir)

  logger.info(`Backend image folder: ${backendUploadDir}`)
  logger.info(`Copied ${copied.length} file(s) from website → backend`)

  for (const row of copied) {
    logger.info(`  ✓ ${row.to}`)
  }

  if (missing.length > 0) {
    logger.warn(`Missing ${missing.length} file(s) in website/public (add them, then run again):`)
    for (const filePath of missing) {
      logger.warn(`  ✗ ${filePath}`)
    }
  }

  if (updateDb) {
    await connectDB()
    try {
      await seedWebsiteContent({ onlyIfEmpty: false, uploadDir: env.uploadDir })
      logger.info('Database updated with /uploads/... paths')
    } finally {
      await disconnectDB()
    }
  } else {
    logger.info('Run with --update-db to save /uploads paths in MongoDB')
  }

  process.exit(missing.length > 0 ? 0 : 0)
}

run().catch((error) => {
  logger.error('Image migration failed', { message: error.message })
  process.exit(1)
})
