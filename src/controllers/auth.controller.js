import * as authService from '../services/auth.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendLegacy } from '../utils/response.js'

export const login = asyncHandler(async (req, res) => {
  const result = await authService.loginAdmin(req.body)
  sendLegacy(res, result)
})

export const getProfile = asyncHandler(async (req, res) => {
  const profile = authService.getAdminProfile(req.admin)
  sendLegacy(res, profile)
})
