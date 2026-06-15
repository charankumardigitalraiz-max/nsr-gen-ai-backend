import mongoose from 'mongoose'
import multer from 'multer'
import { ApiError } from '../errors/ApiError.js'
import { sendError } from '../utils/response.js'
import { HTTP } from '../constants/httpStatus.js'
import { logger } from '../utils/logger.js'
import { env } from '../config/env.js'

export function notFound(req, res) {
  sendError(res, {
    statusCode: HTTP.NOT_FOUND,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  })
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }

  // Multer errors
  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? `File too large. Max size is ${env.maxUploadSizeMb}MB`
        : err.message

    return sendError(res, { statusCode: HTTP.BAD_REQUEST, message })
  }

  // Mongoose validation
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map((e) => e.message)
    return sendError(res, {
      statusCode: HTTP.BAD_REQUEST,
      message: 'Validation failed',
      details,
    })
  }

  // Duplicate key
  if (err?.code === 11000) {
    return sendError(res, {
      statusCode: HTTP.CONFLICT,
      message: 'Duplicate entry',
    })
  }

  const statusCode = err.statusCode || HTTP.INTERNAL
  const message = err.isOperational ? err.message : 'Internal server error'

  if (!err.isOperational) {
    logger.error('Unhandled error', {
      message: err.message,
      stack: env.isProduction ? undefined : err.stack,
    })
  }

  sendError(res, {
    statusCode,
    message,
    details: err.details || undefined,
  })
}
