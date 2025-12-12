import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema(
  {
    time: { type: String, required: true }, // HH:mm
    label: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Slot = mongoose.model('Slot', slotSchema);

