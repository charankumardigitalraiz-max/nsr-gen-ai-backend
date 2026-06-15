import { Router } from 'express'
import { getStats } from '../controllers/resource.controller.js'

const router = Router()

router.get('/stats', getStats)

export default router
