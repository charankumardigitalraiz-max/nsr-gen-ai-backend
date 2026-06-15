import fs from 'fs'
import path from 'path'
import multer from 'multer'
import { env } from '../config/env.js'
import { ApiError } from '../errors/ApiError.js'

if (!fs.existsSync(env.uploadDir)) {
  fs.mkdirSync(env.uploadDir, { recursive: true })
}

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
])

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const safeName = `image-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
    cb(null, safeName)
  },
})

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: env.maxUploadSizeMb * 1024 * 7024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(ApiError.badRequest('Only image files (JPEG, PNG, WebP, GIF, SVG) are allowed'))
    }
    cb(null, true)
  },
}).single('image')

export function buildUploadResponse(file) {
  if (!file) {
    throw ApiError.badRequest('No file uploaded')
  }

  return { url: `/uploads/${file.filename}` }
}
