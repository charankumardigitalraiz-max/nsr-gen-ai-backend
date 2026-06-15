import { Router } from 'express'
import {
  getResource,
  replaceResource,
  createResourceItem,
  updateResourceItem,
  deleteResourceItem,
} from '../controllers/resource.controller.js'
import { authenticate } from '../middleware/auth.js'
import { requireKnownResource } from '../middleware/requireKnownResource.js'
import { logger } from '../utils/logger.js'

const router = Router()

router.get('/:resource', requireKnownResource, getResource)
router.post('/:resource/items', requireKnownResource, authenticate, createResourceItem)
router.put('/:resource/items/:itemId', requireKnownResource, authenticate, updateResourceItem)
router.delete('/:resource/items/:itemId', requireKnownResource, authenticate, deleteResourceItem)
router.post('/:resource', requireKnownResource, authenticate, createResourceItem)
router.put('/:resource', requireKnownResource, authenticate, replaceResource)

logger.info('Resource routes ready (single-item POST/PUT/DELETE + list GET)')

export default router
