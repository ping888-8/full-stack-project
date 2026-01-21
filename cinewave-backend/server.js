// server.js - Point d'entrée de l'application CineWave Backend
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

// Importer les routes
const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const showtimeRoutes = require('./routes/showtimeRoutes');

// Initialiser Express
const app = express();

// Middleware
/*app.use(cors({
  origin: 'http://127.0.0.1:5500', // URL de votre frontend (Live Server)
  credentials: true
}));
*/

app.use(cors({
  origin: function (origin, callback) {
    // Autoriser toutes les origines en développement
    callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/showtimes', showtimeRoutes);

// Route de test
app.get('/', (req, res) => {
  res.json({
    message: '🎬 CineWave API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      movies: '/api/movies',
      bookings: '/api/bookings',
      showtimes: '/api/showtimes'
    }
  });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erreur serveur',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🗄️  Database: ${process.env.DB_NAME}`);
});

module.exports = app;