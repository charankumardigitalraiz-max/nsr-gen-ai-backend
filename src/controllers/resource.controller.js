import * as resourceService from '../services/resource.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendLegacy } from '../utils/response.js'

export const getResource = asyncHandler(async (req, res) => {
  const items = await resourceService.getResourceItems(req.params.resource)
  sendLegacy(res, items)
})

export const replaceResource = asyncHandler(async (req, res) => {
  const result = await resourceService.replaceResourceItems(req.params.resource, req.body)
  sendLegacy(res, result)
})

export const createResourceItem = asyncHandler(async (req, res) => {
  const result = await resourceService.createResourceItem(req.params.resource, req.body)
  sendLegacy(res, result)
})

export const updateResourceItem = asyncHandler(async (req, res) => {
  const result = await resourceService.updateResourceItem(
    req.params.resource,
    req.params.itemId,
    req.body,
  )
  sendLegacy(res, result)
})

export const deleteResourceItem = asyncHandler(async (req, res) => {
  const result = await resourceService.deleteResourceItem(req.params.resource, req.params.itemId)
  sendLegacy(res, result)
})

export const getStats = asyncHandler(async (_req, res) => {
  const stats = await resourceService.getDashboardStats()
  sendLegacy(res, stats)
})
