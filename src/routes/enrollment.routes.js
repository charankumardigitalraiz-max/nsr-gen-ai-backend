import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import {
  submitEnrollment,
  listEnrollments,
  patchEnrollmentStatus,
  removeEnrollment,
} from '../controllers/enrollment.controller.js'
import { validateEnrollment } from '../validators/enrollment.validator.js'
import { authenticate } from '../middleware/auth.js'
import { env } from '../config/env.js'
import { sendError } from '../utils/response.js'
import { HTTP } from '../constants/httpStatus.js'

export const enrollmentLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, {
      statusCode: HTTP.TOO_MANY_REQUESTS,
      message: 'Too many enrollment attempts. Please try again later.',
    })
  },
})

const router = Router()

router.post('/', enrollmentLimiter, validateEnrollment, submitEnrollment)
router.get('/', authenticate, listEnrollments)
router.patch('/:id', authenticate, patchEnrollmentStatus)
router.delete('/:id', authenticate, removeEnrollment)

export default router
