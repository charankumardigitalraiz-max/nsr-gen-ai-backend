import { uploadMiddleware } from '../services/upload.service.js'

export function handleUpload(req, res, next) {
  uploadMiddleware(req, res, (err) => {
    if (err) return next(err)
    next()
  })
}
