import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const backendRoot = path.resolve(__dirname, '../..')

dotenv.config({ path: path.resolve(backendRoot, '.env') })

const nodeEnv = process.env.NODE_ENV || 'development'
const isProduction = nodeEnv === 'production'

function parseClientUrls() {
  const raw = process.env.CLIENT_URLS || process.env.CLIENT_URL || ''
  const urls = raw
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean)

  return urls.length > 0 ? urls : ['http://localhost:5173', 'http://localhost:5174']
}

function requireEnv(name, value) {
  if (!value || (typeof value === 'string' && !value.trim())) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
}

export const env = {
  nodeEnv,
  isProduction,
  port: Number(process.env.PORT) || 5001,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nsr-gen-ai',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-jwt-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD || 'nsr@admin123',
  clientUrls: parseClientUrls(),
  uploadDir: path.resolve(
    backendRoot,
    process.env.UPLOAD_DIR || 'uploads',
  ),
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 200,
    authMax: Number(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  },
  maxUploadSizeMb: Number(process.env.MAX_UPLOAD_SIZE_MB) || 10,
}

if (isProduction) {
  requireEnv('MONGODB_URI', env.mongoUri)
  requireEnv('JWT_SECRET', env.jwtSecret)

  if (env.jwtSecret === 'dev-only-jwt-secret-change-me') {
    throw new Error('JWT_SECRET must be changed in production')
  }
}
