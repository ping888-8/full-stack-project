// routes/authRoutes.js - Routes pour l'authentification
const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  deleteAccount,
  getAllUsers,           // NOUVEAU - Admin
  updateUserRole,        // NOUVEAU - Admin
  deleteUserByAdmin      // NOUVEAU - Admin
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

// ============================================
// ROUTES PUBLIQUES
// ============================================
router.post('/register', register);
router.post('/login', login);

// ============================================
// ROUTES PROTÉGÉES (Utilisateur connecté)
// ============================================
router.get('/me', protect, getMe);
router.delete('/delete', protect, deleteAccount);

// ============================================
// ROUTES ADMIN UNIQUEMENT
// ============================================
router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/users/:id/role', protect, authorize('admin'), updateUserRole);
router.delete('/users/:id', protect, authorize('admin'), deleteUserByAdmin);

module.exports = router;