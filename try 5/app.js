const arrows = document.querySelectorAll(".arrow");
const movieLists = document.querySelectorAll(".movie-list");

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

  console.log(Math.floor(window.innerWidth / 270));
});

// ============================================
// TOGGLE (Dark Mode)
// ============================================

const ball = document.querySelector(".toggle-ball");
const items = document.querySelectorAll(
  ".container,.movie-list-title,.navbar-container,.sidebar,.left-menu-icon,.toggle"
);

ball.addEventListener("click", () => {
  items.forEach((item) => {
    item.classList.toggle("active");
  });
  ball.classList.toggle("active");
});

// ============================================
// SEARCH BAR
// ============================================

const searchIcon = document.getElementById("searchIcon");
const searchBar = document.getElementById("searchBar");
const mainContent = document.getElementById("mainContent");
const searchResults = document.getElementById("searchResults");

// Include both regular movies and featured movies
const allMovies = document.querySelectorAll(".movie-list-item, .featured-content");

// Show/hide search bar
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


  function attachButtonEvents(context=document) {
  const detailButtons = context.querySelectorAll(".movie-list-item-button:nth-child(1)");
  const bookButtons = context.querySelectorAll(".movie-list-item-button:nth-child(2)");

  detailButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const movieItem = e.target.closest(".movie-list-item");
      const title = movieItem.dataset.title;
      if (title) {
        window.location.href = `movie-details.html?title=${encodeURIComponent(title)}`;
      }
    });
  });

  bookButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const movieItem = e.target.closest(".movie-list-item");
      const title = movieItem.dataset.title;
      if (title) {
        window.location.href = `booking.html?title=${encodeURIComponent(title)}`;
      }
    });
  });
}

  // Filter movies
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
      const title = movie.dataset.title.toLowerCase();
      if (title.includes(query)) {
        resultsFound = true;

        let card;

        // If it's a featured movie, create a new small card version
        if (movie.classList.contains("featured-content")) {
          card = document.createElement("div");
          card.className = "movie-list-item";
          card.dataset.title = movie.dataset.title;

          const imgSrc = movie.style.backgroundImage
            .match(/url\(["']?(.*?)["']?\)/)?.[1] || "";

          card.innerHTML = `
            <img class="movie-list-item-img" src="${imgSrc}" alt="${movie.dataset.title}">
            <span class="movie-list-item-title">${movie.dataset.title}</span>
            <p class="movie-list-item-desc">${movie.querySelector(".featured-desc")?.textContent.slice(0, 150) || ''}...</p>
            <div class="movie-list-item-buttons">
              <button class="movie-list-item-button">DETAILS</button>
              <button class="movie-list-item-button">BOOK</button>
            </div>
          `;

          attachButtonEvents(searchResults);
        } else {
          // For regular movies, just clone
          card = movie.cloneNode(true);
        }

        if (searchResults) searchResults.appendChild(card);
      }
    });

    if (searchResults) {
      if (!resultsFound) {
        searchResults.innerHTML = `<p style="color:white; text-align:center; font-size:20px;">Movie not found!</p>`;
      }
    }
  });
}


// ============================================
// BOUTONS DETAILS & BOOK



const detailButtons = document.querySelectorAll(".movie-list-item-button:nth-child(1), .featured-button:nth-child(1)");
const bookButtons = document.querySelectorAll(".movie-list-item-button:nth-child(2), .featured-button:nth-child(2)");



detailButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const movieItem = e.target.closest(".movie-list-item, .featured-content");
    const title = movieItem.dataset.title;
    if (title) {
      window.location.href = `movie-details.html?title=${encodeURIComponent(title)}`;
    }
  });
}); 



bookButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const movieItem = e.target.closest(".movie-list-item, .featured-content");
    const title = movieItem.dataset.title;
    if (title) {
      window.location.href = `booking.html?title=${encodeURIComponent(title)}`;
    }
  });
});




// ============================================
// FONCTION D'ATTACHEMENT POUR LES BOUTONS
// (Utilisée par le script dans index.html)
// ============================================

function attachButtonEvents(context = document) {
  // Cette fonction est maintenant appelée depuis index.html
  // avec la logique de vérification API
  console.log('attachButtonEvents appelé depuis app.js');
}

// ============================================
// GESTION DES CLICKS SUR LES BOUTONS BOOK
// (Ancienne version avec localStorage - désactivée)
// ============================================


document.addEventListener("click", function (e) {
  if (e.target.classList.contains("book-btn")) {
    const user = JSON.parse(localStorage.getItem("cinewaveUser"));
    const movieTitle = e.target.getAttribute("data-title");

    if (!user) {
      alert("Please sign in to book your seat.");
      window.location.href = "login.html";
    } else {
      window.location.href = `booking.html?title=${encodeURIComponent(movieTitle)}`;
    }
  }
});
