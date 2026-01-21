// ============================================
// CINEWAVE ADMIN DASHBOARD
// ============================================

/*const API_URL = 'http://localhost:5000/api';*/
let currentEditMovieId = null;

// ============================================
// VÉRIFICATION ADMIN AU CHARGEMENT
// ============================================
window.addEventListener('load', async () => {
  const user = getUser();
  const token = getToken();

  if (!user || !token) {
    alert('Vous devez être connecté');
    window.location.href = 'login.html';
    return;
  }

  if (user.role !== 'admin') {
    alert('Accès refusé. Cette page est réservée aux administrateurs.');
    window.location.href = 'index.html';
    return;
  }

  // Charger les données du dashboard
  loadDashboardStats();
  loadRecentBookings();
});

// ============================================
// NAVIGATION ENTRE SECTIONS
// ============================================
document.querySelectorAll('.admin-menu li').forEach(item => {
  item.addEventListener('click', () => {
    const section = item.dataset.section;
    
    // Mettre à jour le menu actif
    document.querySelectorAll('.admin-menu li').forEach(li => li.classList.remove('active'));
    item.classList.add('active');

    // Afficher la section correspondante
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(section).classList.add('active');

    // Mettre à jour le titre
    const titles = {
      dashboard: 'Dashboard',
      users: 'User Management',
      movies: 'Movie Management',
      showtimes: 'Showtime Management',
      bookings: 'Booking Management',
      tickets: 'Ticket Verification'
    };
    document.getElementById('sectionTitle').textContent = titles[section];

    // Charger les données de la section
    if (section === 'users') loadUsers();
    if (section === 'movies') loadMovies();
    if (section === 'showtimes') loadShowtimes();
    if (section === 'bookings') loadAllBookings();
  });
});

// ============================================
// LOGOUT
// ============================================
document.getElementById('logoutBtn').addEventListener('click', () => {
  if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
    logout();
  }
});

// ============================================
// DASHBOARD - STATISTIQUES
// ============================================
async function loadDashboardStats() {
  try {
    // Total Users
    const usersRes = await apiGet('/auth/users', true);
    document.getElementById('totalUsers').textContent = usersRes.count || 0;

    // Total Movies
    const moviesRes = await apiGet('/movies');
    document.getElementById('totalMovies').textContent = moviesRes.count || 0;

    // Total Bookings & Revenue
    const bookingsRes = await apiGet('/bookings/all', true);
    const bookings = bookingsRes.data || [];
    document.getElementById('totalBookings').textContent = bookings.length;
    
    const revenue = bookings
      .filter(b => b.status === 'paid')
      .reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);
    document.getElementById('totalRevenue').textContent = revenue.toLocaleString();

  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

async function loadRecentBookings() {
  try {
    const response = await apiGet('/bookings/all', true);
    const bookings = response.data.slice(0, 10); // 10 plus récentes

    const html = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Ticket ID</th>
            <th>User</th>
            <th>Movie</th>
            <th>Date</th>
            <th>Seats</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${bookings.map(b => `
            <tr>
              <td><strong>${b.ticket_id || 'N/A'}</strong></td>
              <td>${b.user_name}</td>
              <td>${b.movie_title}</td>
              <td>${new Date(b.show_date).toLocaleDateString()}</td>
              <td>${b.seats_count}</td>
              <td>${b.total_price} FCFA</td>
              <td><span class="badge ${b.status === 'paid' ? 'badge-success' : 'badge-danger'}">${b.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    document.getElementById('recentBookingsTable').innerHTML = html;
  } catch (error) {
    console.error('Error loading recent bookings:', error);
  }
}

// ============================================
// USER MANAGEMENT
// ============================================
async function loadUsers() {
  try {
    const response = await apiGet('/auth/users', true);
    const users = response.data;

    const html = `
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${users.map(user => `
            <tr>
              <td>${user.id}</td>
              <td>${user.name}</td>
              <td>${user.email}</td>
              <td><span class="badge ${user.role === 'admin' ? 'badge-admin' : 'badge-success'}">${user.role}</span></td>
              <td>${new Date(user.created_at).toLocaleDateString()}</td>
              <td>
                <button class="btn btn-warning" onclick="toggleUserRole(${user.id}, '${user.role}')">
                  ${user.role === 'admin' ? 'Demote' : 'Make Admin'}
                </button>
                <button class="btn btn-danger" onclick="deleteUser(${user.id})">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    document.getElementById('usersTable').innerHTML = html;

    // Search functionality
    document.getElementById('userSearch').addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const rows = document.querySelectorAll('#usersTable tbody tr');
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
      });
    });

  } catch (error) {
    console.error('Error loading users:', error);
    document.getElementById('usersTable').innerHTML = '<p class="loading">Error loading users</p>';
  }
}

async function toggleUserRole(userId, currentRole) {
  const newRole = currentRole === 'admin' ? 'user' : 'admin';
  
  if (!confirm(`Change user role to ${newRole}?`)) return;

  try {
    await apiPut(`/auth/users/${userId}/role`, { role: newRole }, true);
    alert('User role updated successfully');
    loadUsers();
  } catch (error) {
    alert(error.message || 'Error updating user role');
  }
}

async function deleteUser(userId) {
  if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

  try {
    await apiDelete(`/auth/users/${userId}`, true);
    alert('User deleted successfully');
    loadUsers();
    loadDashboardStats();
  } catch (error) {
    alert(error.message || 'Error deleting user');
  }
}

// ============================================
// MOVIE MANAGEMENT
// ============================================
async function loadMovies() {
  try {
    const response = await apiGet('/movies');
    const movies = response.data;

    const html = `
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Duration</th>
            <th>Release Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${movies.map(movie => `
            <tr>
              <td>${movie.id}</td>
              <td><strong>${movie.title}</strong></td>
              <td>${movie.duration} min</td>
              <td>${movie.release_date ? new Date(movie.release_date).toLocaleDateString() : 'N/A'}</td>
              <td>
                <button class="btn btn-warning" onclick="editMovie(${movie.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteMovie(${movie.id})">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    document.getElementById('moviesTable').innerHTML = html;

    // Search functionality
    document.getElementById('movieSearch').addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const rows = document.querySelectorAll('#moviesTable tbody tr');
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
      });
    });

  } catch (error) {
    console.error('Error loading movies:', error);
  }
}

// Modal handlers
document.getElementById('addMovieBtn').addEventListener('click', () => {
  currentEditMovieId = null;
  document.getElementById('movieModalTitle').textContent = 'Add New Movie';
  document.getElementById('movieForm').reset();
  document.getElementById('movieModal').classList.add('active');
});

document.getElementById('closeMovieModal').addEventListener('click', () => {
  document.getElementById('movieModal').classList.remove('active');
});

document.getElementById('movieForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const movieData = {
    title: document.getElementById('movieTitle').value,
    description: document.getElementById('movieDescription').value,
    duration: parseInt(document.getElementById('movieDuration').value),
    poster_url: document.getElementById('moviePoster').value,
    release_date: document.getElementById('movieReleaseDate').value
  };

  try {
    if (currentEditMovieId) {
      await apiPut(`/movies/${currentEditMovieId}`, movieData, true);
      alert('Movie updated successfully');
    } else {
      await apiPost('/movies', movieData, true);
      alert('Movie added successfully');
    }
    
    document.getElementById('movieModal').classList.remove('active');
    loadMovies();
    loadDashboardStats();
  } catch (error) {
    alert(error.message || 'Error saving movie');
  }
});

async function editMovie(movieId) {
  try {
    const response = await apiGet(`/movies/${movieId}`);
    const movie = response.data;

    currentEditMovieId = movieId;
    document.getElementById('movieModalTitle').textContent = 'Edit Movie';
    document.getElementById('movieTitle').value = movie.title;
    document.getElementById('movieDescription').value = movie.description || '';
    document.getElementById('movieDuration').value = movie.duration;
    document.getElementById('moviePoster').value = movie.poster_url || '';
    document.getElementById('movieReleaseDate').value = movie.release_date ? movie.release_date.split('T')[0] : '';
    
    document.getElementById('movieModal').classList.add('active');
  } catch (error) {
    alert('Error loading movie details');
  }
}

async function deleteMovie(movieId) {
  if (!confirm('Delete this movie? This will also delete all its showtimes.')) return;

  try {
    await apiDelete(`/movies/${movieId}`, true);
    alert('Movie deleted successfully');
    loadMovies();
    loadDashboardStats();
  } catch (error) {
    alert(error.message || 'Error deleting movie');
  }
}

// ============================================
// SHOWTIME MANAGEMENT
// ============================================
async function loadShowtimes() {
  try {
    const response = await apiGet('/showtimes');
    const showtimes = response.data;

    const html = `
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Movie</th>
            <th>Room</th>
            <th>Date</th>
            <th>Time</th>
            <th>Price</th>
            <th>Booked Seats</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${showtimes.map(st => `
            <tr>
              <td>${st.id}</td>
              <td><strong>${st.movie_title}</strong></td>
              <td>${st.room_name}</td>
              <td>${new Date(st.show_date).toLocaleDateString()}</td>
              <td>${st.start_time.substring(0, 5)}</td>
              <td>${st.price} FCFA</td>
              <td>${st.booked_seats || 0} / ${st.total_seats}</td>
              <td>
                <button class="btn btn-danger" onclick="deleteShowtime(${st.id})">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    document.getElementById('showtimesTable').innerHTML = html;
  } catch (error) {
    console.error('Error loading showtimes:', error);
  }
}

// Add Showtime Modal
document.getElementById('addShowtimeBtn').addEventListener('click', async () => {
  // Load movies and rooms for the dropdowns
  try {
    const moviesRes = await apiGet('/movies');
    const roomsRes = await apiGet('/rooms', true);

    document.getElementById('showtimeMovie').innerHTML = moviesRes.data
      .map(m => `<option value="${m.id}">${m.title}</option>`)
      .join('');

    document.getElementById('showtimeRoom').innerHTML = roomsRes.data
      .map(r => `<option value="${r.id}">${r.name}</option>`)
      .join('');

    document.getElementById('showtimeModal').classList.add('active');
  } catch (error) {
    alert('Error loading data for showtime form');
  }
});

document.getElementById('closeShowtimeModal').addEventListener('click', () => {
  document.getElementById('showtimeModal').classList.remove('active');
});

document.getElementById('showtimeForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const showtimeData = {
    movie_id: parseInt(document.getElementById('showtimeMovie').value),
    room_id: parseInt(document.getElementById('showtimeRoom').value),
    show_date: document.getElementById('showtimeDate').value,
    start_time: document.getElementById('showtimeTime').value + ':00',
    price: parseFloat(document.getElementById('showtimePrice').value)
  };

  try {
    await apiPost('/showtimes', showtimeData, true);
    alert('Showtime added successfully');
    document.getElementById('showtimeModal').classList.remove('active');
    loadShowtimes();
  } catch (error) {
    alert(error.message || 'Error adding showtime');
  }
});

async function deleteShowtime(showtimeId) {
  if (!confirm('Delete this showtime?')) return;

  try {
    await apiDelete(`/showtimes/${showtimeId}`, true);
    alert('Showtime deleted successfully');
    loadShowtimes();
  } catch (error) {
    alert(error.message || 'Error deleting showtime');
  }
}

// ============================================
// BOOKING MANAGEMENT
// ============================================
async function loadAllBookings() {
  try {
    const response = await apiGet('/bookings/all', true);
    const bookings = response.data;

    const html = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Ticket ID</th>
            <th>User</th>
            <th>Movie</th>
            <th>Date</th>
            <th>Time</th>
            <th>Seats</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${bookings.map(b => `
            <tr>
              <td><strong>${b.ticket_id || 'N/A'}</strong></td>
              <td>${b.user_name}<br><small>${b.user_email}</small></td>
              <td>${b.movie_title}</td>
              <td>${new Date(b.show_date).toLocaleDateString()}</td>
              <td>${b.start_time ? b.start_time.substring(0, 5) : 'N/A'}</td>
              <td>${b.seat_numbers || b.seats_count}</td>
              <td>${b.total_price} FCFA</td>
              <td><span class="badge ${b.status === 'paid' ? 'badge-success' : 'badge-danger'}">${b.status}</span></td>
              <td>
                ${b.status === 'paid' ? 
                  `<button class="btn btn-danger" onclick="cancelBooking(${b.id})">Cancel</button>` : 
                  ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    document.getElementById('bookingsTable').innerHTML = html;

    // Search functionality
    document.getElementById('bookingSearch').addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const rows = document.querySelectorAll('#bookingsTable tbody tr');
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
      });
    });

  } catch (error) {
    console.error('Error loading bookings:', error);
  }
}

async function cancelBooking(bookingId) {
  if (!confirm('Cancel this booking?')) return;

  try {
    await apiPut(`/bookings/${bookingId}/cancel`, {}, true);
    alert('Booking cancelled successfully');
    loadAllBookings();
    loadDashboardStats();
  } catch (error) {
    alert(error.message || 'Error cancelling booking');
  }
}

// ============================================
// TICKET VERIFICATION
// ============================================
document.getElementById('verifyTicketBtn').addEventListener('click', async () => {
  const ticketId = document.getElementById('ticketIdInput').value.trim();

  if (!ticketId) {
    alert('Please enter a ticket ID');
    return;
  }

  try {
    const response = await apiGet(`/bookings/verify/${encodeURIComponent(ticketId)}`, true);
    const booking = response.data;

    const html = `
      <div style="background: #1e1e1e; padding: 20px; border-radius: 10px; border-left: 4px solid #4dbf00;">
        <h3 style="color: #4dbf00; margin-bottom: 15px;">✅ Valid Ticket</h3>
        <p><strong>Ticket ID:</strong> ${booking.ticket_id}</p>
        <p><strong>User:</strong> ${booking.user_name} (${booking.user_email})</p>
        <p><strong>Movie:</strong> ${booking.movie_title}</p>
        <p><strong>Date:</strong> ${new Date(booking.show_date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${booking.start_time ? booking.start_time.substring(0, 5) : 'N/A'}</p>
        <p><strong>Seats:</strong> ${booking.seat_numbers || booking.seats_count}</p>
        <p><strong>Total Paid:</strong> ${booking.total_price} FCFA</p>
        <p><strong>Status:</strong> <span class="badge ${booking.status === 'paid' ? 'badge-success' : 'badge-danger'}">${booking.status}</span></p>
      </div>
    `;

    document.getElementById('ticketResult').innerHTML = html;
  } catch (error) {
    document.getElementById('ticketResult').innerHTML = `
      <div style="background: #1e1e1e; padding: 20px; border-radius: 10px; border-left: 4px solid #ff4444;">
        <h3 style="color: #ff4444; margin-bottom: 15px;">❌ Invalid Ticket</h3>
        <p>${error.message || 'Ticket not found'}</p>
      </div>
    `;
  }
});