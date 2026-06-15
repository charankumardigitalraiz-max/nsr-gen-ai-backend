import { RESOURCE_KEYS } from '../constants/resources.js'
import { ApiError } from '../errors/ApiError.js'

/** Reject unknown resource keys before auth — avoids 401 for paths like /enrollments */
export function requireKnownResource(req, _res, next) {
  const key = req.params.resource
  if (!RESOURCE_KEYS.includes(key)) {
    return next(ApiError.notFound(`Resource "${key}" not found`))
  }
  next()
}
