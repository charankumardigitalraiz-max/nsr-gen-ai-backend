import crypto from 'crypto'
import {
  COURSE_DETAILS,
  SUCCESSFUL_STUDENTS,
  HIRING_PARTNER_BRANDS,
  RECRUITER_TESTIMONIALS,
  VIDEO_TESTIMONIALS,
  FOUNDERS_INFO,
  TRAINING_SERVICES,
} from '../../../website/src/constants/cmsData.js'
import { mapItemAssets, resolveCmsAssetForUpload } from './resolveCmsAssets.js'

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** Stable UUID-like id so re-seeding updates the same logical records */
export function stableItemId(namespace, key) {
  const raw = crypto.createHash('sha256').update(`${namespace}:${key}`).digest('hex')
  return [
    raw.slice(0, 8),
    raw.slice(8, 12),
    `4${raw.slice(13, 16)}`,
    raw.slice(16, 20),
    raw.slice(20, 32),
  ].join('-')
}

export function buildWebsiteSeedData({ uploadDir } = {}) {
  return {
    courses: COURSE_DETAILS.map((course) => {
      const item = mapItemAssets(course, uploadDir, 'courses', ['image'])
      if (uploadDir && course.logo) {
        item.logo = resolveCmsAssetForUpload(course.logo, uploadDir, 'course-logos')
      }
      item.id = stableItemId('course', course.slug)
      return item
    }),
    placements: SUCCESSFUL_STUDENTS.map((student) => ({
      ...mapItemAssets(student, uploadDir, 'placements', ['image']),
      studentStatus: 'placed',
      id: stableItemId('placement', slugify(student.name)),
    })),
    partners: HIRING_PARTNER_BRANDS.map((partner) => ({
      ...mapItemAssets(partner, uploadDir, 'partners', ['logo']),
      id: stableItemId('partner', slugify(partner.name)),
    })),
    staff: FOUNDERS_INFO.map((member) => ({
      ...mapItemAssets(member, uploadDir, 'staff', ['avatar']),
      id: stableItemId('staff', slugify(member.name)),
    })),
    testimonials_recruiter: RECRUITER_TESTIMONIALS.map((item) => ({
      ...mapItemAssets(item, uploadDir, 'recruiters', ['avatar']),
      id: stableItemId('recruiter', slugify(item.name)),
    })),
    testimonials_video: VIDEO_TESTIMONIALS.map((item) => ({
      ...mapItemAssets(item, uploadDir, 'testimonials', ['avatar']),
      review: item.quote || item.review || '',
      quote: item.quote || item.review || '',
      id: stableItemId('video', slugify(item.studentName)),
    })),
    training_services: TRAINING_SERVICES.map((service) => ({
      ...mapItemAssets(service, uploadDir, 'training', ['image']),
      id: stableItemId('training', service.icon),
    })),
  }
}
