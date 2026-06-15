import { ApiError } from '../errors/ApiError.js'

export function validateBody(rules) {
  return (req, _res, next) => {
    try {
      for (const [field, rule] of Object.entries(rules)) {
        const value = req.body[field]

        if (rule.required && (value === undefined || value === null || String(value).trim() === '')) {
          throw ApiError.badRequest(`${field} is required`)
        }

        if (value !== undefined && rule.type === 'array' && !Array.isArray(value)) {
          throw ApiError.badRequest(`${field} must be an array`)
        }

        if (value !== undefined && rule.type === 'string' && typeof value !== 'string') {
          throw ApiError.badRequest(`${field} must be a string`)
        }

        if (typeof value === 'string' && rule.minLength && value.trim().length < rule.minLength) {
          throw ApiError.badRequest(`${field} must be at least ${rule.minLength} characters`)
        }
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}
