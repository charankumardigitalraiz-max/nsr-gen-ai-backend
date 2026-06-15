import { validateBody } from '../middleware/validate.js'

export const validateEnrollment = validateBody({
  name: { required: true, type: 'string', minLength: 2 },
  phone: { required: true, type: 'string', minLength: 10 },
  course: { required: true, type: 'string', minLength: 1 },
  email: { required: false, type: 'string' },
  message: { required: false, type: 'string' },
})
