import { verifyToken } from '../utils/jwt.js'
import { ApiError } from '../errors/ApiError.js'

export function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization

    if (!header?.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Authentication required')
    }

    const token = header.slice(7)
    req.admin = verifyToken(token)
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Invalid or expired token'))
    }
    next(error)
  }
}
