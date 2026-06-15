import * as enrollmentService from '../services/enrollment.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendSuccess } from '../utils/response.js'

export const submitEnrollment = asyncHandler(async (req, res) => {
  const data = await enrollmentService.createEnrollment(req.body)
  sendSuccess(res, {
    statusCode: 201,
    message: 'Enrollment submitted successfully. Our team will contact you soon.',
    data: { id: data.id, createdAt: data.createdAt },
  })
})

export const listEnrollments = asyncHandler(async (req, res) => {
  const items = await enrollmentService.listEnrollments({ status: req.query.status })
  sendSuccess(res, { data: items })
})

export const patchEnrollmentStatus = asyncHandler(async (req, res) => {
  const item = await enrollmentService.updateEnrollmentStatus(req.params.id, req.body.status)
  sendSuccess(res, {
    message: 'Enrollment status updated',
    data: item,
  })
})

export const removeEnrollment = asyncHandler(async (req, res) => {
  await enrollmentService.deleteEnrollment(req.params.id)
  sendSuccess(res, { message: 'Enrollment deleted' })
})
