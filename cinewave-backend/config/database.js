// config/database.js - Configuration de la connexion MySQL
const mysql = require('mysql2');

// Créer un pool de connexions (meilleure performance)
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cinema_booking_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Convertir en Promises pour utiliser async/await
const promisePool = pool.promise();

// Tester la connexion
promisePool.query('SELECT 1')
  .then(() => {
    console.log('✅ MySQL Database connected successfully!');
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });

module.exports = promisePool;