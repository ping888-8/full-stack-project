// ============================================
// APP.JS - CINEWAVE FRONTEND
// Gestion des carrousels, toggle, et recherche uniquement
// Les boutons BOOK/DETAILS sont gérés dans index.html
// ============================================

const arrows = document.querySelectorAll(".arrow");
const movieLists = document.querySelectorAll(".movie-list");

// ============================================
// CARROUSELS (ARROWS)
// ============================================
arrows.forEach((arrow, i) => {
  const itemNumber = movieLists[i].querySelectorAll("img").length;
  let clickCounter = 0;
  arrow.addEventListener("click", () => {
    const ratio = Math.floor(window.innerWidth / 270);
    clickCounter++;
    if (itemNumber - (4 + clickCounter) + (4 - ratio) >= 0) {
      movieLists[i].style.transform = `translateX(${
        movieLists[i].computedStyleMap().get("transform")[0].x.value - 300
      }px)`;
    } else {
      movieLists[i].style.transform = "translateX(0)";
      clickCounter = 0;
    }
  });
});

// ============================================
// TOGGLE (Dark Mode)
// ============================================
const ball = document.querySelector(".toggle-ball");
const items = document.querySelectorAll(
  ".container,.movie-list-title,.navbar-container,.sidebar,.left-menu-icon,.toggle"
);

if (ball) {
  ball.addEventListener("click", () => {
    items.forEach((item) => {
      item.classList.toggle("active");
    });
    ball.classList.toggle("active");
  });
}

// ============================================
// SEARCH BAR
// ============================================
const searchIcon = document.getElementById("searchIcon");
const searchBar = document.getElementById("searchBar");
const mainContent = document.getElementById("mainContent");
const searchResults = document.getElementById("searchResults");
const allMovies = document.querySelectorAll(".movie-list-item, .featured-content");

if (searchIcon && searchBar) {
  searchIcon.addEventListener("click", () => {
    if (searchBar.style.display === "none" || searchBar.style.display === "") {
      searchBar.style.display = "block";
      searchBar.focus();
    } else {
      searchBar.style.display = "none";
      searchBar.value = "";
      if (searchResults) searchResults.style.display = "none";
      if (mainContent) mainContent.style.display = "block";
    }
  });

  searchBar.addEventListener("input", () => {
    const query = searchBar.value.trim().toLowerCase();
    
    if (query.length === 0) {
      if (searchResults) searchResults.style.display = "none";
      if (mainContent) mainContent.style.display = "block";
      return;
    }

    if (mainContent) mainContent.style.display = "none";
    if (searchResults) {
      searchResults.style.display = "grid";
      searchResults.innerHTML = "";
    }

    let resultsFound = false;

    allMovies.forEach(movie => {
      const title = movie.dataset.title?.toLowerCase() || '';
      if (title.includes(query)) {
        resultsFound = true;
        let card;

        if (movie.classList.contains("featured-content")) {
          card = document.createElement("div");
          card.className = "movie-list-item";
          card.dataset.title = movie.dataset.title;

          const imgSrc = movie.style.backgroundImage
            .match(/url\(["']?(.*?)["']?\)/)?.[1] || "";

          card.innerHTML = `
            <img class="movie-list-item-img" src="${imgSrc}" alt="${movie.dataset.title}">
            <span class="movie-list-item-title">${movie.dataset.title}</span>
            <p class="movie-list-item-desc">${movie.querySelector(".featured-desc, .featured-desc1")?.textContent.slice(0, 150) || ''}...</p>
            <div class="movie-list-item-buttons">
              <button class="movie-list-item-button">DETAILS</button>
              <button class="movie-list-item-button">BOOK</button>
            </div>
          `;
        } else {
          card = movie.cloneNode(true);
        }

        if (searchResults) searchResults.appendChild(card);
      }
    });

    if (searchResults) {
      if (!resultsFound) {
        searchResults.innerHTML = `<p style="color:white; text-align:center; font-size:20px; padding:40px;">Movie not found!</p>`;
      } else {
        // Réattacher les événements aux nouveaux boutons de recherche
        if (window.attachBookButtonEvents) window.attachBookButtonEvents();
        if (window.attachDetailsButtonEvents) window.attachDetailsButtonEvents();
      }
    }
  });
}