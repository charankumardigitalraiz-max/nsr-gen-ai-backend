import crypto from 'crypto'
import {
  COURSE_DETAILS,
  SUCCESSFUL_STUDENTS,
  HIRING_PARTNER_BRANDS,
  RECRUITER_TESTIMONIALS,
  VIDEO_TESTIMONIALS,
  FOUNDERS_INFO,
} from '../../../website/src/constants/cmsData.js'

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

export function buildWebsiteSeedData() {
  return {
    courses: COURSE_DETAILS.map((course) => ({
      ...course,
      id: stableItemId('course', course.slug),
    })),
    placements: SUCCESSFUL_STUDENTS.map((student) => ({
      ...student,
      studentStatus: 'placed',
      id: stableItemId('placement', slugify(student.name)),
    })),
    partners: HIRING_PARTNER_BRANDS.map((partner) => ({
      ...partner,
      id: stableItemId('partner', slugify(partner.name)),
    })),
    staff: FOUNDERS_INFO.map((member) => ({
      ...member,
      id: stableItemId('staff', slugify(member.name)),
    })),
    testimonials_recruiter: RECRUITER_TESTIMONIALS.map((item) => ({
      ...item,
      id: stableItemId('recruiter', slugify(item.name)),
    })),
    testimonials_video: VIDEO_TESTIMONIALS.map((item) => ({
      ...item,
      review: item.quote || item.review || '',
      quote: item.quote || item.review || '',
      id: stableItemId('video', slugify(item.studentName)),
    })),
  }
}
