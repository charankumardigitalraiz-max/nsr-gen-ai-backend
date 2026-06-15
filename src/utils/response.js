export function sendSuccess(res, { statusCode = 200, message, data, meta } = {}) {
  const body = { success: true }

  if (message) body.message = message
  if (data !== undefined) body.data = data
  if (meta) body.meta = meta

  return res.status(statusCode).json(body)
}

/** Keep legacy flat responses for admin dashboard compatibility */
export function sendLegacy(res, payload, statusCode = 200) {
  return res.status(statusCode).json(payload)
}

export function sendError(res, { statusCode = 500, message, details }) {
  const body = {
    success: false,
    error: message,
    statusCode,
  }

  if (details) body.details = details

  return res.status(statusCode).json(body)
}
