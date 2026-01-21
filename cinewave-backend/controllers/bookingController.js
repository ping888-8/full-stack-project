// controllers/bookingController.js - Gestion des réservations
const db = require('../config/database');

// Fonction pour générer un Ticket ID unique
function generateTicketId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'CW-';
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { showtime_id, seats } = req.body;
    const user_id = req.user.id;

    // Validation
    if (!showtime_id || !seats || !Array.isArray(seats) || seats.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Séance et sièges requis'
      });
    }

    // Vérifier le format des sièges : [{seat_id, seat_number, seat_type, price}]
    const invalidSeats = seats.filter(s => !s.seat_id || !s.seat_type || !s.price);
    if (invalidSeats.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Format de sièges invalide'
      });
    }

    const seat_ids = seats.map(s => s.seat_id);

    // Vérifier que les sièges ne sont pas déjà réservés
    const [bookedSeats] = await connection.query(`
      SELECT bi.seat_id, s.seat_number
      FROM booking_items bi
      JOIN bookings b ON bi.booking_id = b.id
      JOIN seats s ON bi.seat_id = s.id
      WHERE bi.showtime_id = ? AND bi.seat_id IN (?) AND b.status != 'cancelled'
    `, [showtime_id, seat_ids]);

    if (bookedSeats.length > 0) {
      await connection.rollback();
      const bookedNumbers = bookedSeats.map(s => s.seat_number).join(', ');
      return res.status(400).json({
        success: false,
        message: `Ces sièges sont déjà réservés : ${bookedNumbers}`
      });
    }

    // Calculer le prix total
    const total_price = seats.reduce((sum, seat) => sum + seat.price, 0);

    // Générer le Ticket ID
    let ticket_id;
    let isUnique = false;
    
    while (!isUnique) {
      ticket_id = generateTicketId();
      const [existing] = await connection.query(
        'SELECT id FROM bookings WHERE ticket_id = ?',
        [ticket_id]
      );
      if (existing.length === 0) {
        isUnique = true;
      }
    }

    // Créer la réservation AVEC ticket_id
    const [bookingResult] = await connection.query(
      'INSERT INTO bookings (user_id, showtime_id, ticket_id, total_price, status) VALUES (?, ?, ?, ?, ?)',
      [user_id, showtime_id, ticket_id, total_price, 'paid']
    );

    const booking_id = bookingResult.insertId;

    // Insérer les booking_items avec seat_type
    const bookingItemsValues = seats.map(seat => [
      booking_id, 
      seat.seat_id, 
      showtime_id,
      seat.seat_type,  // Stocker le type
      seat.price
    ]);
    
    await connection.query(
      'INSERT INTO booking_items (booking_id, seat_id, showtime_id, seat_type, seat_price) VALUES ?',
      [bookingItemsValues]
    );

    await connection.commit();

    // Récupérer les détails de la réservation avec les numéros de sièges
    const [bookingDetails] = await connection.query(`
      SELECT 
        b.id,
        b.ticket_id,
        b.total_price,
        b.created_at,
        s.show_date,
        s.start_time,
        m.title as movie_title,
        r.name as room_name,
        u.name as user_name,
        u.email as user_email
      FROM bookings b
      JOIN showtimes s ON b.showtime_id = s.id
      JOIN movies m ON s.movie_id = m.id
      JOIN rooms r ON s.room_id = r.id
      JOIN users u ON b.user_id = u.id
      WHERE b.id = ?
    `, [booking_id]);

    const [seatsBooked] = await connection.query(`
      SELECT 
        s.seat_number, 
        bi.seat_type,
        bi.seat_price
      FROM seats s
      JOIN booking_items bi ON s.id = bi.seat_id
      WHERE bi.booking_id = ?
      ORDER BY s.seat_number
    `, [booking_id]);

    res.status(201).json({
      success: true,
      message: 'Réservation confirmée !',
      data: {
        booking_id,
        ticket_id,  // Retourner le ticket_id généré
        ...bookingDetails[0],
        seats: seatsBooked.map(s => ({
          number: s.seat_number,
          type: s.seat_type,
          price: parseFloat(s.seat_price)
        })),
        seats_count: seats.length,
        seat_numbers: seatsBooked.map(s => s.seat_number).join(', ')
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la réservation'
    });
  } finally {
    connection.release();
  }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/user
// @access  Private
exports.getUserBookings = async (req, res) => {
  try {
    const [bookings] = await db.query(`
      SELECT 
        b.id,
        b.ticket_id,
        b.total_price,
        b.status,
        b.created_at,
        s.show_date,
        s.start_time,
        m.title as movie_title,
        m.poster_url,
        r.name as room_name,
        COUNT(bi.id) as seats_count,
        GROUP_CONCAT(se.seat_number ORDER BY se.seat_number) as seat_numbers
      FROM bookings b
      JOIN showtimes s ON b.showtime_id = s.id
      JOIN movies m ON s.movie_id = m.id
      JOIN rooms r ON s.room_id = r.id
      LEFT JOIN booking_items bi ON b.id = bi.booking_id
      LEFT JOIN seats se ON bi.seat_id = se.id
      WHERE b.user_id = ?
      GROUP BY b.id
      ORDER BY b.created_at DESC
    `, [req.user.id]);

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });

  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des réservations'
    });
  }
};

// @desc    Get single booking details
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res) => {
  try {
    const [bookings] = await db.query(`
      SELECT 
        b.id,
        b.ticket_id,
        b.total_price,
        b.status,
        b.created_at,
        s.show_date,
        s.start_time,
        m.title as movie_title,
        m.poster_url,
        m.duration,
        r.name as room_name,
        u.name as user_name,
        u.email as user_email
      FROM bookings b
      JOIN showtimes s ON b.showtime_id = s.id
      JOIN movies m ON s.movie_id = m.id
      JOIN rooms r ON s.room_id = r.id
      JOIN users u ON b.user_id = u.id
      WHERE b.id = ? AND b.user_id = ?
    `, [req.params.id, req.user.id]);

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée'
      });
    }

    // Récupérer les sièges avec leur type
    const [seats] = await db.query(`
      SELECT 
        s.seat_number,
        bi.seat_type,
        bi.seat_price
      FROM booking_items bi
      JOIN seats s ON bi.seat_id = s.id
      WHERE bi.booking_id = ?
      ORDER BY s.seat_number
    `, [req.params.id]);

    res.status(200).json({
      success: true,
      data: {
        ...bookings[0],
        seats: seats.map(s => ({
          number: s.seat_number,
          type: s.seat_type,
          price: parseFloat(s.seat_price)
        })),
        seat_numbers: seats.map(s => s.seat_number).join(', ')
      }
    });

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la réservation'
    });
  }
};

// @desc    Cancel a booking (User)
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    // Vérifier que la réservation appartient à l'utilisateur
    const [booking] = await db.query(
      'SELECT id, status FROM bookings WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (booking.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée'
      });
    }

    if (booking[0].status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cette réservation est déjà annulée'
      });
    }

    // Annuler la réservation
    await db.query(
      'UPDATE bookings SET status = ? WHERE id = ?',
      ['cancelled', req.params.id]
    );

    res.status(200).json({
      success: true,
      message: 'Réservation annulée avec succès'
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'annulation de la réservation'
    });
  }
};

// ============================================
// FONCTIONS ADMIN
// ============================================

// @desc    Get all bookings (Admin only)
// @route   GET /api/bookings/all
// @access  Private/Admin
exports.getAllBookings = async (req, res) => {
  try {
    const [bookings] = await db.query(`
      SELECT 
        b.id,
        b.ticket_id,
        b.total_price,
        b.status,
        b.created_at,
        s.show_date,
        s.start_time,
        m.title as movie_title,
        r.name as room_name,
        u.name as user_name,
        u.email as user_email,
        COUNT(bi.id) as seats_count,
        GROUP_CONCAT(se.seat_number ORDER BY se.seat_number) as seat_numbers
      FROM bookings b
      JOIN showtimes s ON b.showtime_id = s.id
      JOIN movies m ON s.movie_id = m.id
      JOIN rooms r ON s.room_id = r.id
      JOIN users u ON b.user_id = u.id
      LEFT JOIN booking_items bi ON b.id = bi.booking_id
      LEFT JOIN seats se ON bi.seat_id = se.id
      GROUP BY b.id
      ORDER BY b.created_at DESC
    `);

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });

  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des réservations'
    });
  }
};

// @desc    Verify ticket by ticket ID (Admin only)
// @route   GET /api/bookings/verify/:ticketId
// @access  Private/Admin
exports.verifyTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const [bookings] = await db.query(`
      SELECT 
        b.id,
        b.ticket_id,
        b.total_price,
        b.status,
        b.created_at,
        s.show_date,
        s.start_time,
        m.title as movie_title,
        r.name as room_name,
        u.name as user_name,
        u.email as user_email,
        COUNT(bi.id) as seats_count,
        GROUP_CONCAT(se.seat_number ORDER BY se.seat_number) as seat_numbers
      FROM bookings b
      JOIN showtimes s ON b.showtime_id = s.id
      JOIN movies m ON s.movie_id = m.id
      JOIN rooms r ON s.room_id = r.id
      JOIN users u ON b.user_id = u.id
      LEFT JOIN booking_items bi ON b.id = bi.booking_id
      LEFT JOIN seats se ON bi.seat_id = se.id
      WHERE b.ticket_id = ?
      GROUP BY b.id
    `, [ticketId]);

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ticket non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: bookings[0]
    });

  } catch (error) {
    console.error('Verify ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification du ticket'
    });
  }
};

// @desc    Cancel booking (Admin)
// @route   PUT /api/bookings/:id/cancel/admin
// @access  Private/Admin
exports.cancelBookingByAdmin = async (req, res) => {
  try {
    const [booking] = await db.query(
      'SELECT id, status FROM bookings WHERE id = ?',
      [req.params.id]
    );

    if (booking.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée'
      });
    }

    if (booking[0].status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cette réservation est déjà annulée'
      });
    }

    await db.query(
      'UPDATE bookings SET status = ? WHERE id = ?',
      ['cancelled', req.params.id]
    );

    res.status(200).json({
      success: true,
      message: 'Réservation annulée avec succès par l\'admin'
    });

  } catch (error) {
    console.error('Cancel booking by admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'annulation'
    });
  }
};