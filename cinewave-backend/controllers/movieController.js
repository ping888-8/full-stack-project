// controllers/movieController.js - Gestion des films
const db = require('../config/database');

// @desc    Get all movies
// @route   GET /api/movies
// @access  Public
exports.getAllMovies = async (req, res) => {
  try {
    const [movies] = await db.query(`
      SELECT 
        id, 
        title, 
        description, 
        duration, 
        poster_url, 
        release_date,
        created_at
      FROM movies
      ORDER BY release_date DESC
    `);

    res.status(200).json({
      success: true,
      count: movies.length,
      data: movies
    });

  } catch (error) {
    console.error('Get movies error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des films'
    });
  }
};

// @desc    Get single movie by ID
// @route   GET /api/movies/:id
// @access  Public
exports.getMovieById = async (req, res) => {
  try {
    const [movies] = await db.query(
      'SELECT * FROM movies WHERE id = ?',
      [req.params.id]
    );

    if (movies.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Film non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: movies[0]
    });

  } catch (error) {
    console.error('Get movie error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du film'
    });
  }
};

// @desc    Get movie by title
// @route   GET /api/movies/title/:title
// @access  Public
exports.getMovieByTitle = async (req, res) => {
  try {
    const [movies] = await db.query(
      'SELECT * FROM movies WHERE title LIKE ?',
      [`%${req.params.title}%`]
    );

    if (movies.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Aucun film trouvé avec ce titre'
      });
    }

    res.status(200).json({
      success: true,
      count: movies.length,
      data: movies
    });

  } catch (error) {
    console.error('Search movie error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche'
    });
  }
};

// @desc    Create new movie
// @route   POST /api/movies
// @access  Private/Admin
exports.createMovie = async (req, res) => {
  try {
    const { title, description, duration, poster_url, release_date } = req.body;

    // Validation
    if (!title || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Titre et durée sont requis'
      });
    }

    const [result] = await db.query(
      'INSERT INTO movies (title, description, duration, poster_url, release_date) VALUES (?, ?, ?, ?, ?)',
      [title, description || '', duration, poster_url || null, release_date || null]
    );

    res.status(201).json({
      success: true,
      message: 'Film créé avec succès',
      data: {
        id: result.insertId,
        title,
        description,
        duration,
        poster_url,
        release_date
      }
    });

  } catch (error) {
    console.error('Create movie error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du film'
    });
  }
};

// @desc    Update movie
// @route   PUT /api/movies/:id
// @access  Private/Admin
exports.updateMovie = async (req, res) => {
  try {
    const { title, description, duration, poster_url, release_date } = req.body;

    // Vérifier si le film existe
    const [existingMovie] = await db.query(
      'SELECT id FROM movies WHERE id = ?',
      [req.params.id]
    );

    if (existingMovie.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Film non trouvé'
      });
    }

    // Mettre à jour
    await db.query(
      'UPDATE movies SET title = ?, description = ?, duration = ?, poster_url = ?, release_date = ? WHERE id = ?',
      [title, description, duration, poster_url, release_date, req.params.id]
    );

    res.status(200).json({
      success: true,
      message: 'Film mis à jour avec succès'
    });

  } catch (error) {
    console.error('Update movie error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du film'
    });
  }
};

// @desc    Delete movie
// @route   DELETE /api/movies/:id
// @access  Private/Admin
exports.deleteMovie = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM movies WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Film non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Film supprimé avec succès'
    });

  } catch (error) {
    console.error('Delete movie error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du film'
    });
  }
};