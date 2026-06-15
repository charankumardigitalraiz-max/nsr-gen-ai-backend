import rateLimit from 'express-rate-limit'
import { env } from '../config/env.js'
import { sendError } from '../utils/response.js'
import { HTTP } from '../constants/httpStatus.js'

export const apiLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, {
      statusCode: HTTP.TOO_MANY_REQUESTS,
      message: 'Too many requests. Please try again later.',
    })
  },
})

export const authLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, {
      statusCode: HTTP.TOO_MANY_REQUESTS,
      message: 'Too many login attempts. Please try again later.',
    })
  },
})
