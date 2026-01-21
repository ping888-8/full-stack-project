// controllers/roomController.js - Gestion des salles (NOUVEAU)
const db = require('../config/database');

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Private/Admin
exports.getAllRooms = async (req, res) => {
  try {
    const [rooms] = await db.query(`
      SELECT id, name, total_seats
      FROM rooms
      ORDER BY name
    `);

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms
    });

  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des salles'
    });
  }
};