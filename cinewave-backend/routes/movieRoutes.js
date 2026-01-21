// routes/movieRoutes.js - Routes pour les films
const express = require('express');
const router = express.Router();
const {
  getAllMovies,
  getMovieById,
  getMovieByTitle,
  createMovie,
  updateMovie,
  deleteMovie
} = require('../controllers/movieController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Routes publiques
router.get('/', getAllMovies);
router.get('/:id', getMovieById);
router.get('/title/:title', getMovieByTitle);

// Routes protégées (Admin seulement)
router.post('/', protect, authorize('admin'), createMovie);
router.put('/:id', protect, authorize('admin'), updateMovie);
router.delete('/:id', protect, authorize('admin'), deleteMovie);

module.exports = router;