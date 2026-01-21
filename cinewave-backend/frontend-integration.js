// frontend-integration.js - Code pour connecter le frontend à l'API
// Remplace le système localStorage actuel par des appels API

// ============================================
// CONFIGURATION
// ============================================
const API_URL = 'http://localhost:5000/api';

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

// Récupérer le token stocké
function getToken() {
  return localStorage.getItem('cinewaveToken');
}

// Sauvegarder le token
function saveToken(token) {
  localStorage.setItem('cinewaveToken', token);
}

// Supprimer le token
function removeToken() {
  localStorage.removeItem('cinewaveToken');
}

// Effectuer une requête API avec gestion d'erreurs
async function apiRequest(endpoint, method = 'GET', data = null, needsAuth = false) {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (needsAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const options = {
    method,
    headers
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Erreur lors de la requête');
    }

    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ============================================
// AUTHENTIFICATION
// ============================================

// Inscription
async function register(name, email, password) {
  try {
    const result = await apiRequest('/auth/register', 'POST', {
      name,
      email,
      password
    });

    // Sauvegarder le token et les infos utilisateur
    saveToken(result.token);
    localStorage.setItem('cinewaveUser', JSON.stringify(result.user));

    return result;
  } catch (error) {
    throw error;
  }
}

// Connexion
async function login(email, password) {
  try {
    const result = await apiRequest('/auth/login', 'POST', {
      email,
      password
    });

    // Sauvegarder le token et les infos utilisateur
    saveToken(result.token);
    localStorage.setItem('cinewaveUser', JSON.stringify(result.user));

    return result;
  } catch (error) {
    throw error;
  }
}

// Déconnexion
function logout() {
  removeToken();
  localStorage.removeItem('cinewaveUser');
  window.location.href = 'login.html';
}

// Récupérer le profil utilisateur
async function getProfile() {
  try {
    const result = await apiRequest('/auth/me', 'GET', null, true);
    return result.user;
  } catch (error) {
    // Si le token est invalide, déconnecter
    logout();
    throw error;
  }
}

// Supprimer le compte
async function deleteAccount() {
  try {
    await apiRequest('/auth/delete', 'DELETE', null, true);
    logout();
  } catch (error) {
    throw error;
  }
}

// ============================================
// FILMS
// ============================================

// Récupérer tous les films
async function getAllMovies() {
  try {
    const result = await apiRequest('/movies');
    return result.data;
  } catch (error) {
    throw error;
  }
}

// Récupérer un film par ID
async function getMovieById(id) {
  try {
    const result = await apiRequest(`/movies/${id}`);
    return result.data;
  } catch (error) {
    throw error;
  }
}

// Rechercher un film par titre
async function searchMovieByTitle(title) {
  try {
    const result = await apiRequest(`/movies/title/${title}`);
    return result.data;
  } catch (error) {
    throw error;
  }
}

// ============================================
// SÉANCES
// ============================================

// Récupérer les séances d'un film
async function getShowtimesByMovie(movieId) {
  try {
    const result = await apiRequest(`/showtimes/movie/${movieId}`);
    return result.data;
  } catch (error) {
    throw error;
  }
}

// Récupérer les sièges disponibles pour une séance
async function getAvailableSeats(showtimeId) {
  try {
    const result = await apiRequest(`/showtimes/${showtimeId}/seats`);
    return result.data;
  } catch (error) {
    throw error;
  }
}

// ============================================
// RÉSERVATIONS
// ============================================

// Créer une réservation
async function createBooking(showtimeId, seatIds, totalPrice) {
  try {
    const result = await apiRequest('/bookings', 'POST', {
      showtime_id: showtimeId,
      seat_ids: seatIds,
      total_price: totalPrice
    }, true);

    return result.data;
  } catch (error) {
    throw error;
  }
}

// Récupérer les réservations de l'utilisateur
async function getUserBookings() {
  try {
    const result = await apiRequest('/bookings/user', 'GET', null, true);
    return result.data;
  } catch (error) {
    throw error;
  }
}

// Récupérer une réservation spécifique
async function getBookingById(bookingId) {
  try {
    const result = await apiRequest(`/bookings/${bookingId}`, 'GET', null, true);
    return result.data;
  } catch (error) {
    throw error;
  }
}

// Annuler une réservation
async function cancelBooking(bookingId) {
  try {
    const result = await apiRequest(`/bookings/${bookingId}/cancel`, 'PUT', null, true);
    return result;
  } catch (error) {
    throw error;
  }
}

// ============================================
// EXEMPLE D'UTILISATION DANS LE FRONTEND
// ============================================

/*
// Dans auth.js, remplacer le code de signup :

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("newEmail").value;
  const password = document.getElementById("newPassword").value;
  const name = document.getElementById("newName").value;

  try {
    await register(name, email, password);
    alert("Compte créé avec succès ! Veuillez vous connecter.");
    toggleBack.click();
  } catch (error) {
    alert(error.message || "Erreur lors de la création du compte");
  }
});

// Dans auth.js, remplacer le code de login :

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const result = await login(email, password);
    alert(`Bienvenue ${result.user.name} !`);
    window.location.href = "index.html";
  } catch (error) {
    alert(error.message || "Email ou mot de passe incorrect");
  }
});

// Dans booking.html, lors de la confirmation :

confirmBtn.onclick = async () => {
  const date = dateSelect.value;
  const time = timeSelect.value;
  
  if (!date || !time || selectedSeats.length === 0) {
    alert("Please select date, time, and at least one seat!");
    return;
  }

  try {
    // Remplacer par l'ID de la séance réelle
    const showtimeId = 1; 
    const seatIds = selectedSeats.map(s => s.seatId); // Stocker l'ID du siège
    
    const booking = await createBooking(showtimeId, seatIds, totalPrice);
    
    // Rediriger vers la page de confirmation avec les données de réservation
    window.location.href = `confirmation.html?bookingId=${booking.booking_id}`;
  } catch (error) {
    alert(error.message || "Erreur lors de la réservation");
  }
};
*/