// controllers/showtimeController.js - Gestion des séances (VERSION DEBUG)
const db = require('../config/database');

// @desc    Get all showtimes
// @route   GET /api/showtimes
// @access  Public
exports.getAllShowtimes = async (req, res) => {
  try {
    const [showtimes] = await db.query(`
      SELECT 
        s.id, 
        s.show_date, 
        s.start_time, 
        m.title as movie_title,
        m.poster_url,
        r.name as room_name,
        r.total_seats
      FROM showtimes s
      JOIN movies m ON s.movie_id = m.id
      JOIN rooms r ON s.room_id = r.id
      ORDER BY s.show_date, s.start_time
    `);

    res.status(200).json({
      success: true,
      count: showtimes.length,
      data: showtimes
    });

  } catch (error) {
    console.error('Get showtimes error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des séances'
    });
  }
};

// @desc    Get showtimes for a specific movie
// @route   GET /api/showtimes/movie/:movieId
// @access  Public
exports.getShowtimesByMovie = async (req, res) => {
  try {
    console.log('🎬 getShowtimesByMovie appelée pour movie_id:', req.params.movieId);
    
    // VERSION SIMPLIFIÉE SANS SOUS-REQUÊTE (pour déboguer)
    const [showtimes] = await db.query(`
      SELECT 
        s.id, 
        s.show_date, 
        s.start_time, 
        m.title as movie_title,
        r.name as room_name,
        r.total_seats,
        0 as booked_seats
      FROM showtimes s
      JOIN movies m ON s.movie_id = m.id
      JOIN rooms r ON s.room_id = r.id
      WHERE s.movie_id = ?
      AND s.show_date >= CURDATE()
      ORDER BY s.show_date, s.start_time
    `, [req.params.movieId]);

    console.log('✅ Séances trouvées:', showtimes.length);
    console.log('📅 Détails:', showtimes);

    res.status(200).json({
      success: true,
      count: showtimes.length,
      data: showtimes
    });

  } catch (error) {
    console.error('❌ Get movie showtimes error:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des séances',
      error: error.message // Pour le débogage
    });
  }
};

// @desc    Get available seats for a showtime
// @route   GET /api/showtimes/:id/seats
// @access  Public
exports.getAvailableSeats = async (req, res) => {
  try {
    console.log('🪑 getAvailableSeats appelée pour showtime_id:', req.params.id);
    
    // Récupérer tous les sièges de la salle
    const [showtime] = await db.query(
      'SELECT room_id FROM showtimes WHERE id = ?',
      [req.params.id]
    );

    if (showtime.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Séance non trouvée'
      });
    }

    const [seats] = await db.query(
      'SELECT id, seat_number FROM seats WHERE room_id = ? ORDER BY seat_number',
      [showtime[0].room_id]
    );

    console.log('📊 Total sièges dans la salle:', seats.length);

    // Récupérer les sièges réservés pour cette séance
    const [bookedSeats] = await db.query(`
      SELECT bi.seat_id, s.seat_number
      FROM booking_items bi
      JOIN bookings b ON bi.booking_id = b.id
      JOIN seats s ON bi.seat_id = s.id
      WHERE bi.showtime_id = ? AND b.status != 'cancelled'
    `, [req.params.id]);

    console.log('🔒 Sièges réservés:', bookedSeats.length);

    const bookedSeatIds = bookedSeats.map(s => s.seat_id);

    // Marquer les sièges comme occupés ou disponibles
    const seatsWithStatus = seats.map(seat => ({
      ...seat,
      is_occupied: bookedSeatIds.includes(seat.id)
    }));

    res.status(200).json({
      success: true,
      total_seats: seats.length,
      booked_seats: bookedSeats.length,
      available_seats: seats.length - bookedSeats.length,
      data: seatsWithStatus
    });

  } catch (error) {
    console.error('❌ Get seats error:', error);
    console.error('❌ Error details:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des sièges',
      error: error.message
    });
  }
};

// @desc    Create new showtime
// @route   POST /api/showtimes
// @access  Private/Admin
exports.createShowtime = async (req, res) => {
  try {
    const { movie_id, room_id, show_date, start_time } = req.body;

    // Validation
    if (!movie_id || !room_id || !show_date || !start_time) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis'
      });
    }

    const [result] = await db.query(
      'INSERT INTO showtimes (movie_id, room_id, show_date, start_time) VALUES (?, ?, ?, ?)',
      [movie_id, room_id, show_date, start_time]
    );

    res.status(201).json({
      success: true,
      message: 'Séance créée avec succès',
      data: {
        id: result.insertId,
        movie_id,
        room_id,
        show_date,
        start_time
      }
    });

  } catch (error) {
    console.error('Create showtime error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la séance'
    });
  }
};

// @desc    Delete showtime
// @route   DELETE /api/showtimes/:id
// @access  Private/Admin
exports.deleteShowtime = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM showtimes WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Séance non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Séance supprimée avec succès'
    });

  } catch (error) {
    console.error('Delete showtime error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la séance'
    });
  }
};