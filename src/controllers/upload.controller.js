import { buildUploadResponse } from '../services/upload.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendLegacy } from '../utils/response.js'

export const uploadImage = asyncHandler(async (req, res) => {
  const payload = buildUploadResponse(req.file)
  sendLegacy(res, payload)
})
