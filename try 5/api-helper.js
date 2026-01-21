// ============================================
// API HELPER - FONCTIONS UTILITAIRES
// ============================================

const API_URL = 'http://localhost:5000/api';

// ============================================
// GESTION DU TOKEN
// ============================================

function getToken() {
  return localStorage.getItem('cinewaveToken');
}

function getUser() {
  const userStr = localStorage.getItem('cinewaveUser');
  return userStr ? JSON.parse(userStr) : null;
}

function isLoggedIn() {
  return !!getToken() && !!getUser();
}

function logout() {
  localStorage.removeItem('cinewaveToken');
  localStorage.removeItem('cinewaveUser');
  window.location.href = 'login.html';
}

// ============================================
// REQUÊTES API GÉNÉRIQUES
// ============================================

/**
 * Effectue une requête GET vers l'API
 * @param {string} endpoint - L'endpoint (ex: '/movies' ou '/movies/1')
 * @param {boolean} requiresAuth - Si true, envoie le token JWT
 */
async function apiGet(endpoint, requiresAuth = false) {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (requiresAuth) {
    const token = getToken();
    if (!token) {
      throw new Error('Vous devez être connecté');
    }
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'GET',
    headers
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Erreur lors de la requête');
  }

  return data;
}

/**
 * Effectue une requête POST vers l'API
 * @param {string} endpoint - L'endpoint
 * @param {object} body - Les données à envoyer
 * @param {boolean} requiresAuth - Si true, envoie le token JWT
 */
async function apiPost(endpoint, body, requiresAuth = false) {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (requiresAuth) {
    const token = getToken();
    if (!token) {
      throw new Error('Vous devez être connecté');
    }
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Erreur lors de la requête');
  }

  return data;
}

/**
 * Effectue une requête PUT vers l'API
 * @param {string} endpoint - L'endpoint
 * @param {object} body - Les données à envoyer
 * @param {boolean} requiresAuth - Si true, envoie le token JWT
 */
async function apiPut(endpoint, body, requiresAuth = true) {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (requiresAuth) {
    const token = getToken();
    if (!token) {
      throw new Error('Vous devez être connecté');
    }
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body)
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Erreur lors de la requête');
  }

  return data;
}

/**
 * Effectue une requête DELETE vers l'API
 * @param {string} endpoint - L'endpoint
 * @param {boolean} requiresAuth - Si true, envoie le token JWT
 */
async function apiDelete(endpoint, requiresAuth = true) {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (requiresAuth) {
    const token = getToken();
    if (!token) {
      throw new Error('Vous devez être connecté');
    }
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'DELETE',
    headers
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Erreur lors de la requête');
  }

  return data;
}

// ============================================
// FONCTIONS SPÉCIFIQUES POUR L'APP
// ============================================

/**
 * Récupère un film par son titre
 */
async function getMovieByTitle(title) {
  return await apiGet(`/movies/title/${encodeURIComponent(title)}`);
}

/**
 * Récupère les séances d'un film
 */
async function getShowtimesByMovie(movieId) {
  return await apiGet(`/showtimes/movie/${movieId}`);
}

/**
 * Récupère les sièges disponibles pour une séance
 */
async function getAvailableSeats(showtimeId) {
  return await apiGet(`/showtimes/${showtimeId}/seats`);
}

/**
 * Crée une réservation
 */
async function createBooking(showtimeId, seats) {
  return await apiPost('/bookings', {
    showtime_id: showtimeId,
    seats: seats
  }, true);
}

/**
 * Récupère les réservations de l'utilisateur
 */
async function getUserBookings() {
  return await apiGet('/bookings/user', true);
}

// ============================================
// GESTION DE L'AFFICHAGE DU PROFIL
// ============================================

/**
 * Met à jour l'affichage du profil dans la navbar
 */
function updateProfileDisplay() {
  const user = getUser();
  const profileText = document.querySelector(".profile-text-container");

  if (!profileText) return;

  if (!user) {
    // Utilisateur non connecté
    profileText.innerHTML = '<strong><a href="login.html" style="color: white;">Login</a></strong>';
  } else {
    // Utilisateur connecté
    const firstName = user.name.split(" ")[0];
    profileText.innerHTML = `
      <strong>${firstName} 🎬</strong>
      <button id="logoutBtn" style="
        margin-left:10px;
        background:#4dbf00;
        border:none;
        color:white;
        padding:5px 10px;
        border-radius:6px;
        cursor:pointer;
        font-size:14px;
      ">Logout</button>
    `;

    // Ajouter l'événement de déconnexion
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
          logout();
        }
      });
    }
  }
}

/**
 * Protège une page (redirige vers login si non connecté)
 */
function protectPage() {
  if (!isLoggedIn()) {
    alert('Vous devez être connecté pour accéder à cette page');
    window.location.href = 'login.html';
  }
}

// ============================================
// INITIALISATION AU CHARGEMENT
// ============================================

// Mettre à jour le profil au chargement de chaque page
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateProfileDisplay);
} else {
  updateProfileDisplay();
}