import { Router } from 'express'
import authRoutes from './auth.routes.js'
import metaRoutes from './meta.routes.js'
import resourceRoutes from './resource.routes.js'
import uploadRoutes from './upload.routes.js'
import enrollmentRoutes from './enrollment.routes.js'
import { getHealth } from '../controllers/health.controller.js'

const router = Router()

router.get('/health', getHealth)
router.use('/auth', authRoutes)
router.use('/meta', metaRoutes)
router.use('/upload', uploadRoutes)
router.use('/enrollments', enrollmentRoutes)
router.use('/', resourceRoutes)

export default router
