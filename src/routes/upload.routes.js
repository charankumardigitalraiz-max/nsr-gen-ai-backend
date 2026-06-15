import { Router } from 'express'
import { uploadImage } from '../controllers/upload.controller.js'
import { authenticate } from '../middleware/auth.js'
import { handleUpload } from '../middleware/upload.js'

const router = Router()

router.post('/', authenticate, handleUpload, uploadImage)

export default router
