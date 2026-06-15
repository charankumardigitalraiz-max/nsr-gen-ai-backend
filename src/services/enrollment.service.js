import Enrollment from '../models/Enrollment.js'
import { ApiError } from '../errors/ApiError.js'

const VALID_STATUSES = ['new', 'contacted', 'closed']

function toEnrollmentDto(doc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    phone: doc.phone,
    email: doc.email || '',
    course: doc.course,
    message: doc.message || '',
    status: doc.status,
    source: doc.source,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

export async function createEnrollment(payload) {
  const name = payload.name?.trim()
  const phone = payload.phone?.replace(/\s/g, '') || ''
  const email = payload.email?.trim() || ''
  const course = payload.course?.trim()
  const message = payload.message?.trim() || ''

  if (!name || name.length < 2) {
    throw ApiError.badRequest('Please enter your full name')
  }

  if (!/^\d{10}$/.test(phone)) {
    throw ApiError.badRequest('Enter a valid 10-digit phone number')
  }

  if (!course) {
    throw ApiError.badRequest('Please select a course')
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw ApiError.badRequest('Enter a valid email address')
  }

  const enrollment = await Enrollment.create({
    name,
    phone,
    email,
    course,
    message,
    source: payload.source || 'website-enroll',
  })

  return toEnrollmentDto(enrollment)
}

export async function listEnrollments({ status } = {}) {
  const filter = {}
  if (status && status !== 'all' && VALID_STATUSES.includes(status)) {
    filter.status = status
  }

  const rows = await Enrollment.find(filter).sort({ createdAt: -1 }).lean()
  return rows.map(toEnrollmentDto)
}

export async function updateEnrollmentStatus(id, status) {
  if (!VALID_STATUSES.includes(status)) {
    throw ApiError.badRequest('Invalid status')
  }

  const enrollment = await Enrollment.findByIdAndUpdate(
    id,
    { $set: { status } },
    { new: true, runValidators: true },
  ).lean()

  if (!enrollment) {
    throw ApiError.notFound('Enrollment not found')
  }

  return toEnrollmentDto(enrollment)
}

export async function deleteEnrollment(id) {
  const result = await Enrollment.findByIdAndDelete(id)
  if (!result) {
    throw ApiError.notFound('Enrollment not found')
  }
  return { id }
}

export async function getEnrollmentStats() {
  const [enrollments, enrollmentsNew] = await Promise.all([
    Enrollment.countDocuments(),
    Enrollment.countDocuments({ status: 'new' }),
  ])
  return { enrollments, enrollmentsNew }
}
