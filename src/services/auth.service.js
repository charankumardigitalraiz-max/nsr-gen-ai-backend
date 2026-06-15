import bcrypt from 'bcryptjs'
import Admin from '../models/Admin.js'
import { ApiError } from '../errors/ApiError.js'
import { signToken } from '../utils/jwt.js'

export async function loginAdmin({ username, password }) {
  const normalizedUsername = username.trim().toLowerCase()

  const admin = await Admin.findOne({ username: normalizedUsername })
    .select('+passwordHash')
    .lean()

  if (!admin) {
    throw ApiError.unauthorized('Invalid username or password')
  }

  const isMatch = await bcrypt.compare(password, admin.passwordHash)

  if (!isMatch) {
    throw ApiError.unauthorized('Invalid username or password')
  }

  const token = signToken({ id: admin._id, username: admin.username })

  return {
    token,
    user: { username: admin.username },
  }
}

export function getAdminProfile(adminPayload) {
  return { user: { username: adminPayload.username } }
}
