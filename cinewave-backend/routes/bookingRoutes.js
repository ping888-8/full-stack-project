// routes/bookingRoutes.js - Routes pour les réservations
const express = require('express');
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,          // NOUVEAU - Admin
  verifyTicket,            // NOUVEAU - Admin
  cancelBookingByAdmin     // NOUVEAU - Admin
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

// ============================================
// ROUTES UTILISATEUR (Authentification requise)
// ============================================
router.post('/', protect, createBooking);
router.get('/user', protect, getUserBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/cancel', protect, cancelBooking);

// ============================================
// ROUTES ADMIN UNIQUEMENT
// ============================================
// IMPORTANT: Mettre ces routes AVANT les routes avec paramètres
router.get('/all', protect, authorize('admin'), getAllBookings);
router.get('/verify/:ticketId', protect, authorize('admin'), verifyTicket);
router.put('/:id/cancel/admin', protect, authorize('admin'), cancelBookingByAdmin);

module.exports = router;