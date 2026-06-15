import { Router } from 'express'
import { login, getProfile } from '../controllers/auth.controller.js'
import { authenticate } from '../middleware/auth.js'
import { authLimiter } from '../middleware/rateLimiter.js'
import { validateLogin } from '../validators/auth.validator.js'

const router = Router()

router.post('/login', authLimiter, validateLogin, login)
router.get('/me', authenticate, getProfile)

export default router
