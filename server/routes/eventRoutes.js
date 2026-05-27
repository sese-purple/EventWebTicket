const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  createEvent,
  getPublicEvents,
  getEventById,
  getOrganizerEvents,
  getOrganizerEventById,
  updateEvent,
  deleteEvent,
  getPendingEvents,
  approveEvent,
  rejectEvent,
  getAllEvents,
  getUserBookings,
  getAdminStats,
  getUsers,
  createBooking,
  verifyTicket
} = require('../controllers/eventController');

router.get('/public', getPublicEvents);
router.get('/public/:eventId', getEventById);
router.get('/verify-ticket/:bookingId', verifyTicket);
router.get('/all', authMiddleware, roleMiddleware(['admin']), getAllEvents);
router.get('/pending', authMiddleware, roleMiddleware(['admin']), getPendingEvents);
router.get('/admin-stats', authMiddleware, roleMiddleware(['admin']), getAdminStats);
router.get('/users', authMiddleware, roleMiddleware(['admin']), getUsers);
router.get('/my-events', authMiddleware, roleMiddleware(['organizer']), getOrganizerEvents);
router.get('/organizer/:eventId', authMiddleware, roleMiddleware(['organizer']), getOrganizerEventById);
router.get('/my-bookings', authMiddleware, getUserBookings);

router.post('/', authMiddleware, roleMiddleware(['organizer']), createEvent);
router.post('/booking/create', authMiddleware, createBooking);
router.put('/:eventId', authMiddleware, roleMiddleware(['organizer']), updateEvent);
router.delete('/:eventId', authMiddleware, roleMiddleware(['organizer']), deleteEvent);

router.post('/:eventId/approve', authMiddleware, roleMiddleware(['admin']), approveEvent);
router.post('/:eventId/reject', authMiddleware, roleMiddleware(['admin']), rejectEvent);

module.exports = router;
