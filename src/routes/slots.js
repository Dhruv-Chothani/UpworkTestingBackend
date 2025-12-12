import { Router } from 'express';
import { Slot } from '../models/Slot.js';
import { Booking } from '../models/Booking.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', async (_req, res) => {
  const slots = await Slot.find().sort({ time: 1 });
  res.json(slots);
});

router.post('/', authMiddleware, async (req, res) => {
  const slot = await Slot.create(req.body);
  res.status(201).json(slot);
});

router.patch('/:id', authMiddleware, async (req, res) => {
  const slot = await Slot.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!slot) return res.status(404).json({ message: 'Not found' });
  res.json(slot);
});

router.delete('/:id', authMiddleware, async (req, res) => {
  await Slot.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

router.get('/:date/bookings', authMiddleware, async (req, res) => {
  const bookings = await Booking.find({ date: req.params.date }).sort({ createdAt: -1 });
  res.json(bookings);
});

export default router;

