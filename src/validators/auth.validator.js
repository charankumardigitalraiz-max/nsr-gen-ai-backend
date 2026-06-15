import { validateBody } from '../middleware/validate.js'

export const validateLogin = validateBody({
  username: { required: true, type: 'string', minLength: 3 },
  password: { required: true, type: 'string', minLength: 6 },
})
