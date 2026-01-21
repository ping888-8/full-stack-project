// routes/roomRoutes.js - Routes pour les salles (NOUVEAU)
const express = require('express');
const router = express.Router();
const { getAllRooms } = require('../controllers/Roomcontroller');
const { protect, authorize } = require('../middleware/authMiddleware');

// Routes admin uniquement (les salles sont gérées par l'admin)
router.get('/', protect, authorize('admin'), getAllRooms);

module.exports = router;