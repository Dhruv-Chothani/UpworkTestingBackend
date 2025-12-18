import { Router } from 'express';
import { Booking } from '../models/Booking.js';
import { Slot } from '../models/Slot.js';
import { authMiddleware } from '../middleware/auth.js';
import { appendBookingToSheets, updateBookingStatusInSheets } from '../services/googleSheets.js';
import { sendBookingToSheetsWebhook, updateBookingStatusWebhook } from '../services/googleSheetsWebhook.js';

const router = Router();

router.post('/', async (req, res) => {
  const { date, slotId, patientName, patientPhone, patientEmail, concern } = req.body;
  if (!date || !slotId || !patientName || !patientPhone) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const slot = await Slot.findById(slotId);
  if (!slot) return res.status(404).json({ message: 'Slot not found' });
  if (!slot.isActive) return res.status(400).json({ message: 'Slot is inactive' });

  // Prevent booking past time for the same day
  const slotDateTime = new Date(`${date}T${slot.time}:00`);
  const now = new Date();
  if (slotDateTime.getTime() <= now.getTime()) {
    return res.status(400).json({ message: 'Slot time has already passed' });
  }

  const existing = await Booking.findOne({
    date,
    slotId,
    status: { $ne: 'cancelled' },
  });
  if (existing) {
    return res.status(409).json({ message: 'Slot already booked' });
  }

  const booking = await Booking.create({
    date,
    slotId,
    slotTime: slot.time,
    patientName,
    patientPhone,
    patientEmail,
    concern,
  });

  // Send to Google Sheets (non-blocking) - try both methods
  const bookingData = {
    date,
    slotTime: slot.time,
    patientName,
    patientPhone,
    patientEmail,
    concern: concern || '',
    status: 'pending',
  };

  // Try service account method first
  appendBookingToSheets(bookingData).catch(err => {
    console.error('Failed to send booking to Google Sheets (service account):', err);
    // Try webhook method as fallback
    sendBookingToSheetsWebhook(bookingData).catch(webhookErr => {
      console.error('Failed to send booking to Google Sheets (webhook):', webhookErr);
    });
  });

  res.status(201).json(booking);
});

router.get('/', authMiddleware, async (req, res) => {
  const { date } = req.query;
  const filter = date ? { date } : {};
  const bookings = await Booking.find(filter).sort({ createdAt: -1 });
  res.json(bookings);
});

router.patch('/:id/status', authMiddleware, async (req, res) => {
  const { status } = req.body;
  if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );
  if (!booking) return res.status(404).json({ message: 'Not found' });

  // Update status in Google Sheets (non-blocking) - try both methods
  updateBookingStatusInSheets(booking.date, booking.slotTime, status).catch(err => {
    console.error('Failed to update Google Sheets (service account):', err);
    // Try webhook method as fallback
    updateBookingStatusWebhook(booking.date, booking.slotTime, status).catch(webhookErr => {
      console.error('Failed to update Google Sheets (webhook):', webhookErr);
    });
  });

  res.json(booking);
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ message: 'Failed to delete booking' });
  }
});

export default router;

