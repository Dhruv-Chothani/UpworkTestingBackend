import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    data: { type: Object, default: {} },
  },
  { timestamps: true }
);

export const Content = mongoose.model('Content', contentSchema);

