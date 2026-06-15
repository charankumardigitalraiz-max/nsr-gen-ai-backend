import mongoose from 'mongoose'
import { env } from '../config/env.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendSuccess } from '../utils/response.js'

export const getHealth = asyncHandler(async (_req, res) => {
  const dbState = mongoose.connection.readyState
  const dbStatus = dbState === 1 ? 'connected' : 'disconnected'

  sendSuccess(res, {
    data: {
      status: dbStatus === 'connected' ? 'ok' : 'degraded',
      service: 'nsr-api',
      version: '1.0.0',
      environment: env.nodeEnv,
      database: dbStatus,
      uptimeSeconds: Math.floor(process.uptime()),
    },
  })
})
