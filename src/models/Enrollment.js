import mongoose from 'mongoose'

const enrollmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, default: '' },
    course: { type: String, required: true, trim: true },
    message: { type: String, trim: true, default: '' },
    source: { type: String, default: 'website-enroll' },
    status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

export default mongoose.model('Enrollment', enrollmentSchema)
