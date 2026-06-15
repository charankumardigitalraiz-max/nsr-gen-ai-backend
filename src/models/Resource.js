import mongoose from 'mongoose'
import { RESOURCE_KEYS } from '../constants/resources.js'

const resourceSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, 'Resource key is required'],
      unique: true,
      enum: {
        values: RESOURCE_KEYS,
        message: 'Invalid resource key: {VALUE}',
      },
    },
    items: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

export default mongoose.model('Resource', resourceSchema)
