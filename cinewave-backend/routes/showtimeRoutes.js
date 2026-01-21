// routes/showtimeRoutes.js - Routes pour les séances
const express = require('express');
const router = express.Router();
const {
  getAllShowtimes,
  getShowtimesByMovie,
  getAvailableSeats,
  createShowtime,
  deleteShowtime
} = require('../controllers/showtimeController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Routes publiques
router.get('/', getAllShowtimes);
router.get('/movie/:movieId', getShowtimesByMovie);
router.get('/:id/seats', getAvailableSeats);

// Routes protégées (Admin seulement)
router.post('/', protect, authorize('admin'), createShowtime);
router.delete('/:id', protect, authorize('admin'), deleteShowtime);

module.exports = router;