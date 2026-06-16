import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { buildWebsiteSeedData } from './loadWebsiteConstants.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const websitePublicDir = path.resolve(__dirname, '../../../website/public')
const legacyWebsiteUploadsDir = path.join(websitePublicDir, 'uploads')

function safeFileName(relativePath) {
  return path.basename(relativePath).replace(/\s+/g, '-')
}

function copyFileIfMissing(sourcePath, destPath) {
  if (!fs.existsSync(sourcePath)) return false
  fs.mkdirSync(path.dirname(destPath), { recursive: true })
  if (!fs.existsSync(destPath)) {
    fs.copyFileSync(sourcePath, destPath)
  }
  return true
}

function copyFileForce(sourcePath, destPath) {
  if (!fs.existsSync(sourcePath)) return false
  fs.mkdirSync(path.dirname(destPath), { recursive: true })
  fs.copyFileSync(sourcePath, destPath)
  return true
}

function copyDirectoryContents(srcDir, destDir, { force = false } = {}) {
  if (!fs.existsSync(srcDir)) return []

  const copied = []
  const copy = force ? copyFileForce : copyFileIfMissing
  fs.mkdirSync(destDir, { recursive: true })

  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    if (!entry.isFile()) continue
    const src = path.join(srcDir, entry.name)
    const fileName = safeFileName(entry.name)
    const dest = path.join(destDir, fileName)
    if (copy(src, dest)) {
      copied.push({ from: src, to: `/uploads/${path.basename(destDir)}/${fileName}` })
    }
  }

  return copied
}

/** Copy old website/public/uploads → backend/uploads */
export function syncLegacyWebsiteUploads(backendUploadDir, { skipDirs = [] } = {}) {
  if (!fs.existsSync(legacyWebsiteUploadsDir)) return []

  const skip = new Set(skipDirs.map((d) => d.replace(/\\/g, '/')))
  const copied = []

  const walk = (relativeDir = '') => {
    const relNorm = relativeDir.replace(/\\/g, '/')
    if (skip.has(relNorm) || [...skip].some((dir) => relNorm === dir || relNorm.startsWith(`${dir}/`))) {
      return
    }

    const current = path.join(legacyWebsiteUploadsDir, relativeDir)
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const rel = relativeDir ? `${relativeDir}/${entry.name}` : entry.name
      const src = path.join(legacyWebsiteUploadsDir, rel)
      const dest = path.join(backendUploadDir, rel)
      if (entry.isDirectory()) {
        walk(rel)
      } else if (copyFileIfMissing(src, dest)) {
        copied.push({ from: src, to: `/uploads/${rel.replace(/\\/g, '/')}` })
      }
    }
  }

  walk()
  return copied
}

export function resolveCmsAssetForUpload(assetPath, backendUploadDir, folder, { force = false } = {}) {
  if (!assetPath) return ''
  if (/^https?:\/\//i.test(assetPath)) return assetPath

  const relative = assetPath.replace(/^\//, '')
  const sourcePath = path.join(websitePublicDir, relative)
  const fileName = safeFileName(relative)
  const destPath = path.join(backendUploadDir, folder, fileName)

  const copy = force ? copyFileForce : copyFileIfMissing
  if (!copy(sourcePath, destPath)) {
    return assetPath
  }

  return `/uploads/${folder}/${fileName}`
}

export function mapItemAssets(item, backendUploadDir, folder, fields = [], { force = false } = {}) {
  if (!backendUploadDir || !item) return { ...item }

  const next = { ...item }
  for (const field of fields) {
    if (next[field]) {
      next[field] = resolveCmsAssetForUpload(next[field], backendUploadDir, folder, { force })
    }
  }
  return next
}

/**
 * Copy every local CMS image from website/public into backend/uploads.
 * Only files referenced in cmsData + optional images/ and brands/ folders.
 */
export function migratePresentWebsiteImages(backendUploadDir) {
  fs.mkdirSync(backendUploadDir, { recursive: true })

  const copied = []
  const missing = []

  copied.push(
    ...copyDirectoryContents(path.join(websitePublicDir, 'images'), path.join(backendUploadDir, 'training'), { force: true }),
    ...copyDirectoryContents(path.join(websitePublicDir, 'brands'), path.join(backendUploadDir, 'partners')),
    ...copyDirectoryContents(path.join(websitePublicDir, 'course-logos'), path.join(backendUploadDir, 'course-logos')),
  )

  copied.push(...syncLegacyWebsiteUploads(backendUploadDir, { skipDirs: ['training'] }))

  const raw = buildWebsiteSeedData()

  const track = (assetPath, folder) => {
    if (!assetPath || /^https?:\/\//i.test(assetPath)) return
    const result = resolveCmsAssetForUpload(assetPath, backendUploadDir, folder, { force: true })
    if (result.startsWith('/uploads/')) {
      const already = copied.some((row) => row.to === result)
      if (!already) copied.push({ from: path.join(websitePublicDir, assetPath.replace(/^\//, '')), to: result })
    } else {
      missing.push(assetPath)
    }
  }

  for (const course of raw.courses) {
    track(course.image, 'courses')
    track(course.logo, 'course-logos')
  }
  for (const row of raw.placements) track(row.image, 'placements')
  for (const row of raw.partners) track(row.logo, 'partners')
  for (const row of raw.staff) track(row.avatar, 'staff')
  for (const row of raw.testimonials_recruiter) track(row.avatar, 'recruiters')
  for (const row of raw.testimonials_video) track(row.avatar, 'testimonials')
  for (const row of raw.training_services) track(row.image, 'training')

  const uniqueCopied = [...new Map(copied.map((row) => [row.to, row])).values()]
  const uniqueMissing = [...new Set(missing)]

  return { copied: uniqueCopied, missing: uniqueMissing, backendUploadDir }
}
