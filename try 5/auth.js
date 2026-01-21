/*
// ============================================
// ÉLÉMENTS DU DOM
// ============================================
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const toggleForm = document.getElementById("toggleForm");
const toggleBack = document.getElementById("toggleBack");
const deleteAccount = document.getElementById("deleteAccount");
const formTitle = document.getElementById("formTitle");

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

// Stocker le token et l'utilisateur
function saveAuth(token, user) {
  localStorage.setItem('cinewaveToken', token);
  localStorage.setItem('cinewaveUser', JSON.stringify(user));
}

// Récupérer le token
function getToken() {
  return localStorage.getItem('cinewaveToken');
}

// Supprimer l'authentification
function clearAuth() {
  localStorage.removeItem('cinewaveToken');
  localStorage.removeItem('cinewaveUser');
}

// ============================================
// BASCULER ENTRE LES FORMULAIRES
// ============================================
toggleForm.addEventListener("click", (e) => {
  e.preventDefault();
  loginForm.classList.remove("active");
  loginForm.classList.add("hidden");
  signupForm.classList.remove("hidden");
  signupForm.classList.add("active");
  formTitle.textContent = "Sign Up";
});

toggleBack.addEventListener("click", (e) => {
  e.preventDefault();
  signupForm.classList.remove("active");
  signupForm.classList.add("hidden");
  loginForm.classList.remove("hidden");
  loginForm.classList.add("active");
  formTitle.textContent = "Sign In";
});

// ============================================
// INSCRIPTION (SIGN UP) - AVEC API
// ============================================
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const name = document.getElementById("newName").value.trim();
  const email = document.getElementById("newEmail").value.trim();
  const password = document.getElementById("newPassword").value;

  // Validation côté client
  if (!name || !email || !password) {
    alert("Veuillez remplir tous les champs");
    return;
  }

  if (password.length < 6) {
    alert("Le mot de passe doit contenir au moins 6 caractères");
    return;
  }

  try {
    // Appel API
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Erreur lors de l'inscription");
    }

    // Sauvegarder le token et l'utilisateur
    saveAuth(data.token, data.user);

    alert(`Compte créé avec succès ! Bienvenue ${data.user.name} !`);
    
    // Rediriger vers la page d'accueil
    window.location.href = "index.html";

  } catch (error) {
    console.error('Register error:', error);
    alert(error.message || "Erreur lors de l'inscription. Veuillez réessayer.");
  }
});

// ============================================
// CONNEXION (LOGIN) - AVEC API
// ============================================
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  // Validation côté client
  if (!email || !password) {
    alert("Veuillez remplir tous les champs");
    return;
  }

  try {
    // Appel API
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Email ou mot de passe incorrect");
    }

    // Sauvegarder le token et l'utilisateur
    saveAuth(data.token, data.user);

    alert(`Bienvenue ${data.user.name} !`);
    
    // Rediriger vers la page d'accueil
    window.location.href = "index.html";

  } catch (error) {
    console.error('Login error:', error);
    alert(error.message || "Erreur lors de la connexion. Veuillez réessayer.");
  }
});

// ============================================
// SUPPRESSION DE COMPTE - AVEC API
// ============================================
deleteAccount.addEventListener("click", async (e) => {
  e.preventDefault();

  const token = getToken();
  
  if (!token) {
    alert("Vous devez être connecté pour supprimer votre compte");
    return;
  }

  const confirmation = confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.");
  
  if (!confirmation) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/delete`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Erreur lors de la suppression");
    }

    // Supprimer l'authentification locale
    clearAuth();

    alert("Votre compte a été supprimé avec succès");
    
    // Rester sur la page de login
    loginForm.reset();

  } catch (error) {
    console.error('Delete account error:', error);
    alert(error.message || "Erreur lors de la suppression du compte");
  }
});

// ============================================
// VÉRIFICATION AU CHARGEMENT
// ============================================
window.addEventListener('load', () => {
  // Si l'utilisateur est déjà connecté, rediriger vers l'accueil
  const token = getToken();
  const user = localStorage.getItem('cinewaveUser');
  
  if (token && user) {
    console.log('Utilisateur déjà connecté, redirection...');
    // Optionnel : vous pouvez décommenter la ligne suivante
    // window.location.href = "index.html";
  }
});*/

// ============================================
// CINEWAVE AUTH SYSTEM - INTÉGRATION API BACKEND
// ============================================

// API_URL est défini dans api-helper.js, pas besoin de le redéclarer ici
// Si api-helper.js n'est pas chargé, décommentez la ligne suivante :
// const API_URL = 'http://localhost:5000/api';

// ============================================
// ÉLÉMENTS DU DOM
// ============================================
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const toggleForm = document.getElementById("toggleForm");
const toggleBack = document.getElementById("toggleBack");
const deleteAccount = document.getElementById("deleteAccount");
const formTitle = document.getElementById("formTitle");

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

// Stocker le token et l'utilisateur
function saveAuth(token, user) {
  localStorage.setItem('cinewaveToken', token);
  localStorage.setItem('cinewaveUser', JSON.stringify(user));
}

// Récupérer le token
function getToken() {
  return localStorage.getItem('cinewaveToken');
}

// Récupérer l'utilisateur
function getUser() {
  const user = localStorage.getItem('cinewaveUser');
  return user ? JSON.parse(user) : null;
}

// Supprimer l'authentification
function clearAuth() {
  localStorage.removeItem('cinewaveToken');
  localStorage.removeItem('cinewaveUser');
}

// ============================================
// BASCULER ENTRE LES FORMULAIRES
// ============================================
toggleForm.addEventListener("click", (e) => {
  e.preventDefault();
  loginForm.classList.remove("active");
  loginForm.classList.add("hidden");
  signupForm.classList.remove("hidden");
  signupForm.classList.add("active");
  formTitle.textContent = "Sign Up";
});

toggleBack.addEventListener("click", (e) => {
  e.preventDefault();
  signupForm.classList.remove("active");
  signupForm.classList.add("hidden");
  loginForm.classList.remove("hidden");
  loginForm.classList.add("active");
  formTitle.textContent = "Sign In";
});

// ============================================
// INSCRIPTION (SIGN UP) - AVEC API
// ============================================
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const name = document.getElementById("newName").value.trim();
  const email = document.getElementById("newEmail").value.trim();
  const password = document.getElementById("newPassword").value;

  // Validation côté client
  if (!name || !email || !password) {
    alert("Veuillez remplir tous les champs");
    return;
  }

  if (password.length < 6) {
    alert("Le mot de passe doit contenir au moins 6 caractères");
    return;
  }

  try {
    // Appel API
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Erreur lors de l'inscription");
    }

    // Sauvegarder le token et l'utilisateur
    saveAuth(data.token, data.user);

    alert(`Compte créé avec succès ! Bienvenue ${data.user.name} !`);
    
    // NOUVEAU : Vérifier si l'utilisateur est admin
    if (data.user.role === 'admin') {
      console.log('✅ Utilisateur admin détecté, redirection vers dashboard...');
      window.location.href = "admin-dashboard.html";
    } else {
      window.location.href = "index.html";
    }

  } catch (error) {
    console.error('Register error:', error);
    alert(error.message || "Erreur lors de l'inscription. Veuillez réessayer.");
  }
});

// ============================================
// CONNEXION (LOGIN) - AVEC API ET REDIRECTION ADMIN
// ============================================
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  // Validation côté client
  if (!email || !password) {
    alert("Veuillez remplir tous les champs");
    return;
  }

  try {
    console.log('🔐 Tentative de connexion:', email);
    
    // Appel API
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    console.log('📥 Réponse du serveur:', data);

    if (!data.success) {
      throw new Error(data.message || "Email ou mot de passe incorrect");
    }

    // Sauvegarder le token et l'utilisateur
    saveAuth(data.token, data.user);

    console.log('✅ Connexion réussie:', data.user);
    console.log('👤 Rôle de l\'utilisateur:', data.user.role);

    // NOUVEAU : Redirection selon le rôle
    if (data.user.role === 'admin') {
      alert(`Bienvenue Admin ${data.user.name} ! Redirection vers le dashboard...`);
      console.log('🚀 Redirection vers admin-dashboard.html');
      window.location.href = "admin-dashboard.html";
    } else {
      alert(`Bienvenue ${data.user.name} !`);
      console.log('🚀 Redirection vers index.html');
      window.location.href = "index.html";
    }

  } catch (error) {
    console.error('❌ Login error:', error);
    alert(error.message || "Erreur lors de la connexion. Veuillez réessayer.");
  }
});

// ============================================
// SUPPRESSION DE COMPTE - AVEC API
// ============================================
deleteAccount.addEventListener("click", async (e) => {
  e.preventDefault();

  const token = getToken();
  
  if (!token) {
    alert("Vous devez être connecté pour supprimer votre compte");
    return;
  }

  const confirmation = confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.");
  
  if (!confirmation) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/delete`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Erreur lors de la suppression");
    }

    // Supprimer l'authentification locale
    clearAuth();

    alert("Votre compte a été supprimé avec succès");
    
    // Rester sur la page de login
    loginForm.reset();

  } catch (error) {
    console.error('Delete account error:', error);
    alert(error.message || "Erreur lors de la suppression du compte");
  }
});

// ============================================
// VÉRIFICATION AU CHARGEMENT
// ============================================
window.addEventListener('load', () => {
  // Si l'utilisateur est déjà connecté, rediriger selon son rôle
  const token = getToken();
  const user = getUser();
  
  if (token && user) {
    console.log('Utilisateur déjà connecté:', user);
    
    // Optionnel : Redirection automatique
    // Décommentez si vous voulez rediriger automatiquement
    /*
    if (user.role === 'admin') {
      console.log('Redirection auto vers admin dashboard...');
      window.location.href = "admin-dashboard.html";
    } else {
      console.log('Redirection auto vers index...');
      window.location.href = "index.html";
    }
    */
  }
});
