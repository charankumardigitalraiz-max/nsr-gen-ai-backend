import { HTTP } from '../constants/httpStatus.js'

export class ApiError extends Error {
  constructor(message, statusCode = HTTP.INTERNAL, details = null) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.details = details
    this.isOperational = true
  }

  static badRequest(message, details) {
    return new ApiError(message, HTTP.BAD_REQUEST, details)
  }

  static unauthorized(message = 'Authentication required') {
    return new ApiError(message, HTTP.UNAUTHORIZED)
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(message, HTTP.FORBIDDEN)
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(message, HTTP.NOT_FOUND)
  }

  static tooManyRequests(message = 'Too many requests') {
    return new ApiError(message, HTTP.TOO_MANY_REQUESTS)
  }
}
