import crypto from 'crypto'
import Resource from '../models/Resource.js'
import { RESOURCE_KEYS, STATS_KEY_MAP } from '../constants/resources.js'
import { ApiError } from '../errors/ApiError.js'
import { getEnrollmentStats } from './enrollment.service.js'

export function assertValidResourceKey(key) {
  if (!RESOURCE_KEYS.includes(key)) {
    throw ApiError.notFound(`Resource "${key}" not found`)
  }
}

function newItemId() {
  return crypto.randomUUID()
}

function ensureItemIds(items) {
  let changed = false
  const withIds = items.map((item) => {
    if (item?.id) return item
    changed = true
    return { ...item, id: newItemId() }
  })
  return { items: withIds, changed }
}

async function persistItemsIfNeeded(key, items, changed) {
  if (!changed) return items
  await Resource.updateOne({ key }, { $set: { items } })
  return items
}

export async function getResourceItems(key) {
  assertValidResourceKey(key)

  const doc = await Resource.findOne({ key }).select('items').lean()
  const raw = doc?.items ?? []
  const { items, changed } = ensureItemIds(raw)
  return persistItemsIfNeeded(key, items, changed)
}

export async function replaceResourceItems(key, items) {
  assertValidResourceKey(key)

  if (!Array.isArray(items)) {
    throw ApiError.badRequest('Data must be a JSON array')
  }

  const doc = await Resource.findOneAndUpdate(
    { key },
    { $set: { items } },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true },
  ).select('items')

  return {
    message: `${key} updated successfully`,
    count: doc.items.length,
  }
}

function assertItemPayload(item) {
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    throw ApiError.badRequest('Item must be a JSON object')
  }
}

export async function createResourceItem(key, item) {
  assertValidResourceKey(key)
  assertItemPayload(item)

  const { id, ...rest } = item
  const newItem = { ...rest, id: id || newItemId() }

  const doc = await Resource.findOneAndUpdate(
    { key },
    { $push: { items: newItem } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).select('items')

  return {
    message: 'Item created successfully',
    item: newItem,
    count: doc.items.length,
  }
}

export async function updateResourceItem(key, itemId, item) {
  assertValidResourceKey(key)
  assertItemPayload(item)

  const updatedItem = { ...item, id: itemId }

  const doc = await Resource.findOneAndUpdate(
    { key, 'items.id': itemId },
    { $set: { 'items.$': updatedItem } },
    { new: true },
  ).select('items')

  if (!doc) {
    throw ApiError.notFound(`Item "${itemId}" not found`)
  }

  return {
    message: 'Item updated successfully',
    item: updatedItem,
    count: doc.items.length,
  }
}

export async function deleteResourceItem(key, itemId) {
  assertValidResourceKey(key)

  const existing = await Resource.findOne({ key, 'items.id': itemId }).select('_id')
  if (!existing) {
    throw ApiError.notFound(`Item "${itemId}" not found`)
  }

  const doc = await Resource.findOneAndUpdate(
    { key },
    { $pull: { items: { id: itemId } } },
    { new: true },
  ).select('items')

  return {
    message: 'Item deleted successfully',
    count: doc.items.length,
  }
}

export async function getDashboardStats() {
  const rows = await Resource.aggregate([
    { $match: { key: { $in: RESOURCE_KEYS } } },
    {
      $project: {
        key: 1,
        count: { $size: { $ifNull: ['$items', []] } },
      },
    },
  ])

  const stats = {
    courses: 0,
    placements: 0,
    studentsPlaced: 0,
    studentsJobPending: 0,
    studentsStudying: 0,
    recruiter: 0,
    video: 0,
    partner: 0,
    staff: 0,
    enrollments: 0,
    enrollmentsNew: 0,
    trainingServices: 0,
  }

  for (const row of rows) {
    const statKey = STATS_KEY_MAP[row.key]
    if (statKey) stats[statKey] = row.count
  }

  const placementsDoc = await Resource.findOne({ key: 'placements' }).select('items').lean()
  const placementItems = placementsDoc?.items ?? []

  for (const item of placementItems) {
    const status = item?.studentStatus || 'placed'
    if (status === 'placed') stats.studentsPlaced += 1
    else if (status === 'job-pending') stats.studentsJobPending += 1
    else if (status === 'studying') stats.studentsStudying += 1
  }

  stats.placements = placementItems.length

  const enrollmentStats = await getEnrollmentStats()
  stats.enrollments = enrollmentStats.enrollments
  stats.enrollmentsNew = enrollmentStats.enrollmentsNew

  return stats
}
