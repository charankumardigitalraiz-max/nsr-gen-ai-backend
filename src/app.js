import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import { env } from './config/env.js'
import apiRoutes from './routes/index.js'
import { apiLimiter } from './middleware/rateLimiter.js'
import { requestLogger } from './middleware/requestLogger.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

export function createApp() {
  const app = express()

  app.set('trust proxy', 1)

  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }))

  app.use(
    cors({
      origin: env.clientUrls,
      credentials: true,
    }),
  )

  app.use(compression())
  app.use(express.json({ limit: '50mb' }))
  app.use(express.urlencoded({ extended: true, limit: '1mb' }))

  if (!env.isProduction) {
    app.use(requestLogger)
  }

  app.use('/uploads', express.static(env.uploadDir, {
    maxAge: env.isProduction ? '7d' : 0,
    etag: true,
  }))

  app.use('/api', apiRoutes)

  app.use(notFound)
  app.use(errorHandler)

  return app
}
