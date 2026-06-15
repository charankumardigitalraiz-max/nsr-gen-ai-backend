import { createApp } from './app.js'
import { connectDB, disconnectDB } from './config/db.js'
import { env } from './config/env.js'
import { RESOURCE_KEYS } from './constants/resources.js'
import { logger } from './utils/logger.js'

const app = createApp()
let server

async function start() {
  await connectDB()

  server = app.listen(env.port, () => {
    logger.info(`NSR API running on http://localhost:${env.port}`, {
      environment: env.nodeEnv,
      cors: env.clientUrls,
      uploads: env.uploadDir,
      resources: RESOURCE_KEYS,
      publicRoutes: ['GET /health', 'POST /enrollments', 'GET /:resource'],
    })
  })
}

function shutdown(signal) {
  logger.info(`${signal} received. Shutting down gracefully...`)

  if (!server) {
    process.exit(0)
    return
  }

  server.close(async () => {
    await disconnectDB()
    logger.info('Server closed')
    process.exit(0)
  })

  setTimeout(() => {
    logger.error('Forced shutdown after timeout')
    process.exit(1)
  }, 10000)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { reason: String(reason) })
})

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { message: error.message, stack: error.stack })
  shutdown('uncaughtException')
})

start().catch((error) => {
  logger.error('Failed to start server', { message: error.message })
  process.exit(1)
})
